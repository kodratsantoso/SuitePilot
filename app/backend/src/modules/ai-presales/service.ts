import { prisma } from '../../lib/prisma.js'
import { AppError, Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import { analyzeRequirements } from '../../lib/skills/analyze-requirements.js'
import { classifyPainPoints } from '../../lib/skills/classify-pain-points.js'
import { recommendModules } from '../../lib/skills/recommend-modules.js'
import { estimateScope } from '../../lib/skills/estimate-scope.js'
import { generateProposalDraft } from '../../lib/skills/generate-proposal-draft.js'
import type {
  RunRequirementAnalysisInput,
  RunPainPointClassificationInput,
  RunModuleRecommendationInput,
  RunScopeEstimationInput,
  RunProposalDraftInput,
} from './schema.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

function avgConfidence(scores: (number | null | undefined)[]): number {
  const valid = scores.filter((s): s is number => typeof s === 'number')
  if (valid.length === 0) return 50
  return valid.reduce((sum, s) => sum + s, 0) / valid.length
}

// ── Requirement Analysis ───────────────────────────────────────────────────────

export async function runRequirementAnalysis(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunRequirementAnalysisInput
) {
  await validateProjectAccess(organizationId, projectId)

  const requirements = await prisma.requirement.findMany({
    where: {
      projectId,
      ...(input.discoverySessionId && { discoverySessionId: input.discoverySessionId }),
    },
    take: 50,
  })

  if (requirements.length === 0) {
    throw Errors.validation('No requirements found for this project')
  }

  const answers = input.discoverySessionId
    ? await prisma.discoveryAnswer.findMany({
        where: { discoverySessionId: input.discoverySessionId },
        include: { question: { select: { question: true, category: true } } },
        take: 30,
      })
    : []

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: { customer: { select: { name: true } } },
  })

  let results
  try {
    results = await analyzeRequirements(
      requirements.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        source: r.source,
        priority: r.priority,
      })),
      {
        projectName: project!.name,
        discoveryAnswers: answers.map((a) => ({
          question: a.question.question,
          answer: a.answer,
        })),
      }
    )
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  // Replace existing analyses for these requirements
  await prisma.requirementAnalysis.deleteMany({
    where: {
      requirementId: { in: requirements.map((r) => r.id) },
      projectId,
    },
  })

  await prisma.requirementAnalysis.createMany({
    data: results.map((r) => ({
      organizationId,
      projectId,
      discoverySessionId: input.discoverySessionId ?? null,
      requirementId: r.requirementId,
      analysis: r.analysis,
      confidenceScore: r.confidenceScore,
      evidence: r.evidence as any,
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'analyze-requirements',
    })),
  })

  const created = await prisma.requirementAnalysis.findMany({
    where: { projectId, requirementId: { in: results.map((r) => r.requirementId) } },
    include: { requirement: { select: { id: true, title: true, priority: true } } },
    orderBy: { createdAt: 'desc' },
    take: results.length,
  })

  const confidence = avgConfidence(results.map((r) => r.confidenceScore))

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      projectId,
      organizationId,
      discoverySessionId: input.discoverySessionId ?? null,
      outputType: 'REQUIREMENT_ANALYSIS',
      title: 'Requirement Analysis',
      content: JSON.stringify(results),
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'analyze-requirements',
      confidenceScore: confidence,
      createdBy: actorId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'RequirementAnalysis',
    entityId: output.id,
    action: 'CREATE',
    afterData: { analysisCount: results.length, confidenceScore: confidence },
  })

  return {
    analysisCount: results.length,
    generatedOutputId: output.id,
    analyses: created,
  }
}

export async function listRequirementAnalyses(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const [total, analyses] = await prisma.$transaction([
    prisma.requirementAnalysis.count({ where: { projectId, organizationId } }),
    prisma.requirementAnalysis.findMany({
      where: { projectId, organizationId },
      include: { requirement: { select: { id: true, title: true, priority: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { analyses, meta: paginationMeta(total, page, perPage) }
}

// ── Pain Point Classification ──────────────────────────────────────────────────

export async function runPainPointClassification(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunPainPointClassificationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const painPoints = await prisma.painPoint.findMany({
    where: {
      projectId,
      ...(input.discoverySessionId && { discoverySessionId: input.discoverySessionId }),
    },
    take: 50,
  })

  if (painPoints.length === 0) {
    throw Errors.validation('No pain points found for this project')
  }

  const answers = input.discoverySessionId
    ? await prisma.discoveryAnswer.findMany({
        where: { discoverySessionId: input.discoverySessionId },
        include: { question: { select: { question: true, category: true } } },
        take: 30,
      })
    : []

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: { customer: { select: { name: true } } },
  })

  let results
  try {
    results = await classifyPainPoints(
      painPoints.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        severity: p.severity,
        impactedArea: p.impactedArea,
      })),
      {
        projectName: project!.name,
        discoveryAnswers: answers.map((a) => ({
          question: a.question.question,
          answer: a.answer,
        })),
      }
    )
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  // Replace existing classifications for these pain points
  await prisma.painPointClassification.deleteMany({
    where: {
      painPointId: { in: painPoints.map((p) => p.id) },
      projectId,
    },
  })

  await prisma.painPointClassification.createMany({
    data: results.map((r) => ({
      organizationId,
      projectId,
      painPointId: r.painPointId,
      category: r.category,
      severity: r.severity as any,
      rootCause: r.rootCause,
      recommendation: r.recommendation,
      confidenceScore: r.confidenceScore,
    })),
  })

  const created = await prisma.painPointClassification.findMany({
    where: { projectId, painPointId: { in: results.map((r) => r.painPointId) } },
    include: { painPoint: { select: { id: true, title: true, severity: true } } },
    orderBy: { createdAt: 'desc' },
    take: results.length,
  })

  const confidence = avgConfidence(results.map((r) => r.confidenceScore))

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      projectId,
      organizationId,
      discoverySessionId: input.discoverySessionId ?? null,
      outputType: 'PAIN_POINT_ANALYSIS',
      title: 'Pain Point Classification',
      content: JSON.stringify(results),
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'classify-pain-points',
      confidenceScore: confidence,
      createdBy: actorId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'PainPointClassification',
    entityId: output.id,
    action: 'CREATE',
    afterData: { classificationCount: results.length, confidenceScore: confidence },
  })

  return {
    classificationCount: results.length,
    generatedOutputId: output.id,
    classifications: created,
  }
}

export async function listPainPointAnalyses(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const [total, classifications] = await prisma.$transaction([
    prisma.painPointClassification.count({ where: { projectId, organizationId } }),
    prisma.painPointClassification.findMany({
      where: { projectId, organizationId },
      include: { painPoint: { select: { id: true, title: true, severity: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { classifications, meta: paginationMeta(total, page, perPage) }
}

// ── Module Recommendations ─────────────────────────────────────────────────────

export async function runModuleRecommendation(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunModuleRecommendationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const [requirements, painPoints, project] = await Promise.all([
    prisma.requirement.findMany({ where: { projectId }, take: 100 }),
    prisma.painPoint.findMany({ where: { projectId }, take: 100 }),
    prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: { customer: { select: { name: true } } },
    }),
  ])

  const answers = input.discoverySessionId
    ? await prisma.discoveryAnswer.findMany({
        where: { discoverySessionId: input.discoverySessionId },
        include: { question: { select: { question: true, category: true } } },
        take: 50,
      })
    : []

  let results
  try {
    results = await recommendModules({
      projectName: project!.name,
      projectType: project!.projectType,
      requirements: requirements.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
        source: r.source,
      })),
      painPoints: painPoints.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        severity: p.severity,
      })),
      discoveryAnswers: answers.map((a) => ({
        question: a.question.question,
        answer: a.answer,
        category: a.question.category,
      })),
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  // Replace existing module recommendations for this project
  await prisma.moduleRecommendationAnalysis.deleteMany({ where: { projectId } })

  await prisma.moduleRecommendationAnalysis.createMany({
    data: results.map((r) => ({
      organizationId,
      projectId,
      discoverySessionId: input.discoverySessionId ?? null,
      moduleName: r.moduleName,
      rationale: r.rationale,
      impactedArea: r.impactedArea,
      implementationImpact: r.implementationImpact,
      assumptions: r.assumptions,
      confidenceScore: r.confidenceScore,
      evidence: r.evidence as any,
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'recommend-modules',
    })),
  })

  const created = await prisma.moduleRecommendationAnalysis.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })

  const confidence = avgConfidence(results.map((r) => r.confidenceScore))

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      projectId,
      organizationId,
      discoverySessionId: input.discoverySessionId ?? null,
      outputType: 'MODULE_RECOMMENDATION',
      title: 'Module Recommendations',
      content: JSON.stringify(results),
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'recommend-modules',
      confidenceScore: confidence,
      createdBy: actorId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ModuleRecommendationAnalysis',
    entityId: output.id,
    action: 'CREATE',
    afterData: { moduleCount: results.length, confidenceScore: confidence },
  })

  return {
    moduleCount: results.length,
    generatedOutputId: output.id,
    recommendations: created,
  }
}

export async function listModuleRecommendations(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const [total, recommendations] = await prisma.$transaction([
    prisma.moduleRecommendationAnalysis.count({ where: { projectId, organizationId } }),
    prisma.moduleRecommendationAnalysis.findMany({
      where: { projectId, organizationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: perPage,
    }),
  ])

  return { recommendations, meta: paginationMeta(total, page, perPage) }
}

// ── Scope Estimation ───────────────────────────────────────────────────────────

export async function runScopeEstimation(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunScopeEstimationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const [requirements, painPoints, moduleRecs, project] = await Promise.all([
    prisma.requirement.findMany({ where: { projectId }, take: 100 }),
    prisma.painPoint.findMany({ where: { projectId }, take: 100 }),
    prisma.moduleRecommendationAnalysis.findMany({ where: { projectId } }),
    prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: { customer: { select: { name: true } } },
    }),
  ])

  const answers = input.discoverySessionId
    ? await prisma.discoveryAnswer.findMany({
        where: { discoverySessionId: input.discoverySessionId },
        include: { question: { select: { question: true, category: true } } },
        take: 50,
      })
    : []

  let result
  try {
    result = await estimateScope({
      projectName: project!.name,
      projectType: project!.projectType,
      requirements: requirements.map((r) => ({ title: r.title, priority: r.priority })),
      painPoints: painPoints.map((p) => ({ title: p.title, severity: p.severity })),
      moduleRecommendations: moduleRecs.map((m) => ({
        moduleName: m.moduleName,
        implementationOrder: 1,
        implementationImpact: m.implementationImpact ?? '',
      })),
      discoveryAnswers: answers.map((a) => ({
        question: a.question.question,
        answer: a.answer,
        category: a.question.category,
      })),
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  const scopeSummary = result.scopeSummary
  const assumptions = result.assumptions
  const exclusions = result.exclusions
  const risks = result.risks

  const estimation = await prisma.scopeEstimation.create({
    data: {
      organizationId,
      projectId,
      discoverySessionId: input.discoverySessionId ?? null,
      scopeSummary,
      implementationApproach: result.implementationApproach,
      estimatedComplexity: result.estimatedComplexity as any,
      assumptions,
      exclusions,
      risks,
      confidenceScore: result.confidenceScore,
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'estimate-scope',
    },
  })

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      projectId,
      organizationId,
      discoverySessionId: input.discoverySessionId ?? null,
      outputType: 'SCOPE_DRAFT',
      title: 'Scope Estimation',
      content: JSON.stringify(result),
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'estimate-scope',
      confidenceScore: result.confidenceScore,
      createdBy: actorId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ScopeEstimation',
    entityId: estimation.id,
    action: 'CREATE',
    afterData: { complexity: result.estimatedComplexity, confidenceScore: result.confidenceScore },
  })

  return {
    generatedOutputId: output.id,
    estimation,
    workstreams: result.workstreams,
    complexityFactors: result.complexityFactors,
  }
}

export async function listScopeEstimations(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const [total, estimations] = await prisma.$transaction([
    prisma.scopeEstimation.count({ where: { projectId, organizationId } }),
    prisma.scopeEstimation.findMany({
      where: { projectId, organizationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { estimations, meta: paginationMeta(total, page, perPage) }
}

// ── Proposal Draft ─────────────────────────────────────────────────────────────

export async function runProposalDraftGeneration(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunProposalDraftInput
) {
  await validateProjectAccess(organizationId, projectId)

  const [requirements, painPoints, moduleRecs, latestScope, project] = await Promise.all([
    prisma.requirement.findMany({ where: { projectId }, take: 100 }),
    prisma.painPoint.findMany({ where: { projectId }, take: 100 }),
    prisma.moduleRecommendationAnalysis.findMany({ where: { projectId } }),
    prisma.scopeEstimation.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: { customer: { select: { name: true } } },
    }),
  ])

  const answers = input.discoverySessionId
    ? await prisma.discoveryAnswer.findMany({
        where: { discoverySessionId: input.discoverySessionId },
        include: { question: { select: { question: true, category: true } } },
        take: 50,
      })
    : []

  let result
  try {
    result = await generateProposalDraft({
      projectName: project!.name,
      projectType: project!.projectType,
      customerName: project!.customer.name,
      requirements: requirements.map((r) => ({
        title: r.title,
        priority: r.priority,
        source: r.source,
      })),
      painPoints: painPoints.map((p) => ({ title: p.title, severity: p.severity })),
      moduleRecommendations: moduleRecs.map((m) => ({
        moduleName: m.moduleName,
        rationale: m.rationale,
        implementationOrder: 1,
      })),
      scopeEstimation: latestScope
        ? {
            estimatedComplexity: latestScope.estimatedComplexity,
            implementationApproach: latestScope.implementationApproach ?? '',
            assumptions: latestScope.assumptions ?? '',
            risks: latestScope.risks ?? '',
          }
        : undefined,
      discoveryAnswers: answers.map((a) => ({
        question: a.question.question,
        answer: a.answer,
        category: a.question.category,
      })),
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      projectId,
      organizationId,
      discoverySessionId: input.discoverySessionId ?? null,
      outputType: 'PROPOSAL_DRAFT',
      title: result.proposalTitle,
      content: JSON.stringify(result),
      generatedByAgent: 'PresalesAgent',
      generatedBySkill: 'generate-proposal-draft',
      confidenceScore: result.overallConfidenceScore,
      createdBy: actorId,
    },
  })

  const sections = await Promise.all(
    result.sections.map((s) =>
      prisma.proposalDraftSection.create({
        data: {
          organizationId,
          projectId,
          generatedOutputId: output.id,
          sectionType: s.sectionType as any,
          title: s.title,
          content: s.content,
          sortOrder: s.sortOrder,
        },
      })
    )
  )

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProposalDraftSection',
    entityId: output.id,
    action: 'CREATE',
    afterData: {
      proposalTitle: result.proposalTitle,
      sectionCount: sections.length,
      confidenceScore: result.overallConfidenceScore,
    },
  })

  return {
    generatedOutputId: output.id,
    proposalTitle: result.proposalTitle,
    overallConfidenceScore: result.overallConfidenceScore,
    output,
    sections,
  }
}

export async function listProposalDrafts(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const [total, drafts] = await prisma.$transaction([
    prisma.aiGeneratedOutput.count({
      where: { projectId, organizationId, outputType: 'PROPOSAL_DRAFT' },
    }),
    prisma.aiGeneratedOutput.findMany({
      where: { projectId, organizationId, outputType: 'PROPOSAL_DRAFT' },
      include: { proposalSections: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { drafts, meta: paginationMeta(total, page, perPage) }
}

// ── NetSuite Module Catalog ────────────────────────────────────────────────────

export async function getNetsuiteCatalog() {
  return prisma.netsuiteModuleCatalog.findMany({
    orderBy: [{ category: 'asc' }, { moduleName: 'asc' }],
  })
}
