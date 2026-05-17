import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import type {
  CreateAgentInput,
  CreateDocumentInput,
  CreateEvaluationCaseInput,
  CreateKnowledgeDocumentInput,
  CreateKnowledgeSourceInput,
  CreateReviewCommentInput,
  CreateSkillInput,
  RetrieveKnowledgeInput,
  RunEvaluationInput,
  UpdateDocumentInput,
  UpdateKnowledgeSourceInput,
} from './schema.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

function chunkContent(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim()
  if (!normalized) return []
  const chunks: string[] = []
  for (let i = 0; i < normalized.length; i += 1200) {
    chunks.push(normalized.slice(i, i + 1200))
  }
  return chunks
}

function lexicalScore(query: string, content: string) {
  const terms = query.toLowerCase().split(/\W+/).filter((term) => term.length > 2)
  if (terms.length === 0) return 0
  const lower = content.toLowerCase()
  return terms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0) / terms.length
}

async function createDocumentVersion(documentId: string) {
  const document = await prisma.projectDocument.findUnique({
    where: { id: documentId },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!document) throw Errors.notFound('ProjectDocument')

  const latest = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: { version: 'desc' },
  })

  return prisma.documentVersion.create({
    data: {
      documentId,
      version: (latest?.version ?? 0) + 1,
      snapshot: {
        title: document.title,
        status: document.status,
        documentType: document.documentType,
        sections: document.sections.map((section) => ({
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder,
        })),
      },
    },
  })
}

export async function listDocuments(organizationId: string, projectId: string, query: { page?: string; perPage?: string; status?: string; documentType?: string }) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    organizationId,
    projectId,
    ...(query.status && { status: query.status as any }),
    ...(query.documentType && { documentType: query.documentType as any }),
  }

  const [total, documents] = await prisma.$transaction([
    prisma.projectDocument.count({ where }),
    prisma.projectDocument.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        aiGeneratedOutput: { select: { id: true, title: true, status: true } },
        _count: { select: { sections: true, versions: true, reviewComments: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { documents, meta: paginationMeta(total, page, perPage) }
}

export async function getDocument(organizationId: string, projectId: string, documentId: string) {
  await validateProjectAccess(organizationId, projectId)
  const document = await prisma.projectDocument.findFirst({
    where: { id: documentId, organizationId, projectId },
    include: {
      sections: { orderBy: { sortOrder: 'asc' } },
      versions: { orderBy: { version: 'desc' } },
      reviewComments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
      creator: { select: { id: true, name: true, email: true } },
    },
  })
  if (!document) throw Errors.notFound('ProjectDocument')
  return document
}

export async function createDocument(organizationId: string, projectId: string, actorId: string, input: CreateDocumentInput) {
  await validateProjectAccess(organizationId, projectId)

  if (input.aiGeneratedOutputId) {
    const output = await prisma.aiGeneratedOutput.findFirst({ where: { id: input.aiGeneratedOutputId, organizationId, projectId } })
    if (!output) throw Errors.notFound('AiGeneratedOutput')
  }

  const document = await prisma.projectDocument.create({
    data: {
      organizationId,
      projectId,
      title: input.title,
      documentType: input.documentType,
      templateId: input.templateId,
      aiGeneratedOutputId: input.aiGeneratedOutputId,
      createdBy: actorId,
      sections: {
        create: (input.sections ?? []).map((section, index) => ({
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder ?? index,
        })),
      },
    },
    include: { sections: { orderBy: { sortOrder: 'asc' } }, _count: { select: { versions: true, reviewComments: true } } },
  })
  await createDocumentVersion(document.id)

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectDocument',
    entityId: document.id,
    action: 'CREATE',
    afterData: { title: document.title, documentType: document.documentType, status: document.status },
  })

  return getDocument(organizationId, projectId, document.id)
}

export async function updateDocument(organizationId: string, projectId: string, documentId: string, actorId: string, input: UpdateDocumentInput) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.projectDocument.findFirst({ where: { id: documentId, organizationId, projectId } })
  if (!existing) throw Errors.notFound('ProjectDocument')

  await prisma.$transaction(async (tx) => {
    await tx.projectDocument.update({
      where: { id: documentId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.status && { status: input.status }),
      },
    })

    if (input.sections) {
      await tx.documentSection.deleteMany({ where: { documentId } })
      await tx.documentSection.createMany({
        data: input.sections.map((section, index) => ({
          documentId,
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder ?? index,
        })),
      })
    }
  })

  const version = await createDocumentVersion(documentId)

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectDocument',
    entityId: documentId,
    action: input.status === 'APPROVED' ? 'APPROVE' : 'UPDATE',
    beforeData: { title: existing.title, status: existing.status },
    afterData: { title: input.title ?? existing.title, status: input.status ?? existing.status, version: version.version, versionNote: input.versionNote },
  })

  return getDocument(organizationId, projectId, documentId)
}

export async function createReviewComment(organizationId: string, projectId: string, documentId: string, actorId: string, input: CreateReviewCommentInput) {
  await getDocument(organizationId, projectId, documentId)
  const comment = await prisma.reviewComment.create({
    data: { documentId, authorId: actorId, comment: input.comment },
    include: { author: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ReviewComment',
    entityId: comment.id,
    action: 'CREATE',
    afterData: { documentId, status: comment.status },
  })

  return comment
}

export async function listKnowledgeSources(organizationId: string, projectId: string, query: { page?: string; perPage?: string; status?: string; category?: string }) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    organizationId,
    projectId,
    ...(query.status && { status: query.status as any }),
    ...(query.category && { category: query.category }),
  }
  const [total, sources] = await prisma.$transaction([
    prisma.knowledgeSource.count({ where }),
    prisma.knowledgeSource.findMany({
      where,
      include: { owner: { select: { id: true, name: true } }, _count: { select: { documents: true } } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])
  return { sources, meta: paginationMeta(total, page, perPage) }
}

export async function createKnowledgeSource(organizationId: string, projectId: string, actorId: string, input: CreateKnowledgeSourceInput) {
  await validateProjectAccess(organizationId, projectId)
  const source = await prisma.knowledgeSource.create({
    data: { organizationId, projectId, ownerId: actorId, name: input.name, category: input.category, status: input.status ?? 'ACTIVE' },
  })
  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'KnowledgeSource',
    entityId: source.id,
    action: 'CREATE',
    afterData: { name: source.name, category: source.category, status: source.status },
  })
  return source
}

export async function updateKnowledgeSource(organizationId: string, projectId: string, sourceId: string, actorId: string, input: UpdateKnowledgeSourceInput) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.knowledgeSource.findFirst({ where: { id: sourceId, organizationId, projectId } })
  if (!existing) throw Errors.notFound('KnowledgeSource')
  const source = await prisma.knowledgeSource.update({
    where: { id: sourceId },
    data: { ...input, lastUpdatedAt: new Date() },
  })
  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'KnowledgeSource',
    entityId: source.id,
    action: 'UPDATE',
    beforeData: { name: existing.name, status: existing.status },
    afterData: { name: source.name, status: source.status },
  })
  return source
}

export async function createKnowledgeDocument(organizationId: string, projectId: string, actorId: string, input: CreateKnowledgeDocumentInput) {
  await validateProjectAccess(organizationId, projectId)
  const source = await prisma.knowledgeSource.findFirst({ where: { id: input.sourceId, organizationId, projectId } })
  if (!source) throw Errors.notFound('KnowledgeSource')
  const chunks = chunkContent(input.content)

  const document = await prisma.knowledgeDocument.create({
    data: {
      sourceId: input.sourceId,
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      chunks: {
        create: chunks.map((content, index) => ({
          content,
          chunkIndex: index,
          citationRef: `${input.title}#${index + 1}`,
        })),
      },
    },
    include: { chunks: true },
  })

  await prisma.knowledgeSource.update({ where: { id: input.sourceId }, data: { lastUpdatedAt: new Date() } })
  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'KnowledgeDocument',
    entityId: document.id,
    action: 'CREATE',
    afterData: { title: document.title, sourceId: input.sourceId, chunkCount: document.chunks.length },
  })
  return document
}

export async function retrieveKnowledge(organizationId: string, projectId: string, input: RetrieveKnowledgeInput) {
  await validateProjectAccess(organizationId, projectId)
  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      document: {
        source: {
          organizationId,
          projectId,
          status: 'ACTIVE',
        },
      },
    },
    include: { document: { include: { source: true } } },
    take: 250,
  })

  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: lexicalScore(input.query, chunk.content) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  await prisma.retrievalLog.createMany({
    data: ranked.map((chunk) => ({
      chunkId: chunk.id,
      query: input.query,
      score: chunk.score,
      usedInOutputId: input.usedInOutputId,
    })),
  })

  return ranked.map((chunk) => ({
    id: chunk.id,
    content: chunk.content,
    citationRef: chunk.citationRef,
    score: chunk.score,
    document: { id: chunk.document.id, title: chunk.document.title },
    source: { id: chunk.document.source.id, name: chunk.document.source.name, category: chunk.document.source.category },
  }))
}

export async function listEvaluationCases(organizationId: string, projectId: string, query: { page?: string; perPage?: string; skillName?: string }) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = { organizationId, projectId, ...(query.skillName && { skillName: query.skillName }) }
  const [total, cases] = await prisma.$transaction([
    prisma.evaluationCase.count({ where }),
    prisma.evaluationCase.findMany({
      where,
      include: { _count: { select: { runs: true } } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])
  return { cases, meta: paginationMeta(total, page, perPage) }
}

export async function createEvaluationCase(organizationId: string, projectId: string, actorId: string, input: CreateEvaluationCaseInput) {
  await validateProjectAccess(organizationId, projectId)
  const testCase = await prisma.evaluationCase.create({
    data: { organizationId, projectId, skillName: input.skillName, prompt: input.prompt, expectedAnswer: input.expectedAnswer, riskLevel: input.riskLevel ?? 'MEDIUM' },
  })
  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'EvaluationCase',
    entityId: testCase.id,
    action: 'CREATE',
    afterData: { skillName: testCase.skillName, riskLevel: testCase.riskLevel },
  })
  return testCase
}

export async function runEvaluation(organizationId: string, projectId: string, actorId: string, input: RunEvaluationInput) {
  await validateProjectAccess(organizationId, projectId)
  const testCase = await prisma.evaluationCase.findFirst({ where: { id: input.evaluationCaseId, organizationId, projectId } })
  if (!testCase) throw Errors.notFound('EvaluationCase')
  if (input.aiGeneratedOutputId) {
    const output = await prisma.aiGeneratedOutput.findFirst({ where: { id: input.aiGeneratedOutputId, organizationId, projectId } })
    if (!output) throw Errors.notFound('AiGeneratedOutput')
  }

  const run = await prisma.aiEvaluationRun.create({
    data: {
      organizationId,
      projectId,
      evaluationCaseId: input.evaluationCaseId,
      aiGeneratedOutputId: input.aiGeneratedOutputId,
      runBy: actorId,
      status: input.status ?? (input.score != null && input.score >= 75 ? 'PASSED' : 'NEEDS_REVIEW'),
      score: input.score,
      findings: (input.findings ?? []) as any,
    },
    include: { evaluationCase: true, runner: { select: { id: true, name: true } }, output: { select: { id: true, title: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'AiEvaluationRun',
    entityId: run.id,
    action: 'CREATE',
    afterData: { evaluationCaseId: run.evaluationCaseId, status: run.status, score: run.score },
  })
  return run
}

export async function listEvaluationRuns(organizationId: string, projectId: string, query: { page?: string; perPage?: string; status?: string }) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = { organizationId, projectId, ...(query.status && { status: query.status as any }) }
  const [total, runs] = await prisma.$transaction([
    prisma.aiEvaluationRun.count({ where }),
    prisma.aiEvaluationRun.findMany({
      where,
      include: { evaluationCase: true, runner: { select: { id: true, name: true } }, output: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])
  return { runs, meta: paginationMeta(total, page, perPage) }
}

export async function listRegistry() {
  const [agents, skills] = await prisma.$transaction([
    prisma.aiAgent.findMany({ include: { skills: true }, orderBy: { role: 'asc' } }),
    prisma.aiSkill.findMany({ include: { agent: { select: { id: true, name: true, role: true } } }, orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
  ])
  return { agents, skills }
}

export async function createAgent(actorOrganizationId: string, actorId: string, input: CreateAgentInput) {
  const agent = await prisma.aiAgent.create({ data: { ...input, isActive: input.isActive ?? true } })
  await writeAuditLog({
    organizationId: actorOrganizationId,
    actorUserId: actorId,
    entityType: 'AiAgent',
    entityId: agent.id,
    action: 'CREATE',
    afterData: { name: agent.name, role: agent.role },
  })
  return agent
}

export async function createSkill(actorOrganizationId: string, actorId: string, input: CreateSkillInput) {
  if (input.agentId) {
    const agent = await prisma.aiAgent.findUnique({ where: { id: input.agentId } })
    if (!agent) throw Errors.notFound('AiAgent')
  }
  const skill = await prisma.aiSkill.create({ data: { ...input, isActive: input.isActive ?? true } })
  await writeAuditLog({
    organizationId: actorOrganizationId,
    actorUserId: actorId,
    entityType: 'AiSkill',
    entityId: skill.id,
    action: 'CREATE',
    afterData: { name: skill.name, category: skill.category, agentId: skill.agentId },
  })
  return skill
}
