import { prisma } from '../../lib/prisma.js'
import { AppError, Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import { generateFitGap } from '../../lib/skills/generate-fit-gap.js'
import { generateUatScenarios } from '../../lib/skills/generate-uat.js'
import { generateSop } from '../../lib/skills/generate-sop.js'
import type {
  CreateWorkstreamInput,
  UpdateWorkstreamInput,
  CreateBusinessProcessInput,
  UpdateBusinessProcessInput,
  CreateProcessStepInput,
  RunFitGapInput,
  RunUatInput,
  RunSopInput,
  UpdateUatScenarioInput,
  UpdateSopInput,
  CreateDeliverableInput,
} from './schema.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

// ── Workstreams ────────────────────────────────────────────────────────────────

export async function listWorkstreams(organizationId: string, projectId: string) {
  await validateProjectAccess(organizationId, projectId)

  const workstreams = await prisma.functionalWorkstream.findMany({
    where: { projectId, organizationId },
    include: {
      owner: { select: { id: true, name: true } },
      _count: {
        select: {
          businessProcesses: true,
          uatScenarios: true,
          sopDocuments: true,
          functionalDeliverables: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  })

  return workstreams
}

export async function createWorkstream(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateWorkstreamInput
) {
  await validateProjectAccess(organizationId, projectId)

  const workstream = await prisma.functionalWorkstream.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
    include: {
      owner: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'FunctionalWorkstream',
    entityId: workstream.id,
    action: 'CREATE',
    afterData: { name: workstream.name, status: workstream.status },
  })

  return workstream
}

export async function updateWorkstream(
  organizationId: string,
  projectId: string,
  workstreamId: string,
  actorId: string,
  input: UpdateWorkstreamInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.functionalWorkstream.findFirst({
    where: { id: workstreamId, projectId },
  })
  if (!existing) throw Errors.notFound('FunctionalWorkstream')

  const workstream = await prisma.functionalWorkstream.update({
    where: { id: workstreamId },
    data: { ...input, updatedAt: new Date() },
    include: {
      owner: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'FunctionalWorkstream',
    entityId: workstreamId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: workstream.status },
  })

  return workstream
}

// ── Business Processes ─────────────────────────────────────────────────────────

export async function listProcesses(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; workstreamId?: string; processCategory?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.workstreamId && { workstreamId: query.workstreamId }),
    ...(query.processCategory && { processCategory: query.processCategory as any }),
  }

  const [total, processes] = await prisma.$transaction([
    prisma.businessProcess.count({ where }),
    prisma.businessProcess.findMany({
      where,
      include: {
        workstream: { select: { id: true, name: true } },
        _count: { select: { steps: true } },
      },
      orderBy: [{ processCategory: 'asc' }, { processName: 'asc' }],
      skip,
      take: perPage,
    }),
  ])

  return { processes, meta: paginationMeta(total, page, perPage) }
}

export async function getProcess(
  organizationId: string,
  projectId: string,
  processId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const process = await prisma.businessProcess.findFirst({
    where: { id: processId, projectId },
    include: {
      steps: { orderBy: { stepOrder: 'asc' } },
      workstream: { select: { id: true, name: true } },
    },
  })

  if (!process) throw Errors.notFound('BusinessProcess')
  return process
}

export async function createProcess(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateBusinessProcessInput
) {
  await validateProjectAccess(organizationId, projectId)

  const process = await prisma.businessProcess.create({
    data: {
      ...input,
      projectId,
      organizationId,
      impactedModules: input.impactedModules as any,
    },
    include: {
      workstream: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'BusinessProcess',
    entityId: process.id,
    action: 'CREATE',
    afterData: { processName: process.processName, processCategory: process.processCategory },
  })

  return process
}

export async function updateProcess(
  organizationId: string,
  projectId: string,
  processId: string,
  actorId: string,
  input: UpdateBusinessProcessInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.businessProcess.findFirst({
    where: { id: processId, projectId },
  })
  if (!existing) throw Errors.notFound('BusinessProcess')

  const process = await prisma.businessProcess.update({
    where: { id: processId },
    data: {
      ...input,
      impactedModules: input.impactedModules !== undefined ? (input.impactedModules as any) : undefined,
      updatedAt: new Date(),
    },
    include: {
      workstream: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'BusinessProcess',
    entityId: processId,
    action: 'UPDATE',
    beforeData: { processName: existing.processName },
    afterData: { processName: process.processName },
  })

  return process
}

export async function createProcessStep(
  organizationId: string,
  projectId: string,
  processId: string,
  input: CreateProcessStepInput
) {
  await validateProjectAccess(organizationId, projectId)

  const process = await prisma.businessProcess.findFirst({
    where: { id: processId, projectId },
  })
  if (!process) throw Errors.notFound('BusinessProcess')

  const step = await prisma.processStep.create({
    data: {
      ...input,
      businessProcessId: processId,
    },
  })

  return step
}

// ── AI Fit-Gap Analysis ────────────────────────────────────────────────────────

export async function runFitGapAnalysis(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunFitGapInput
) {
  const project = await validateProjectAccess(organizationId, projectId)

  const requirements = await prisma.requirement.findMany({
    where: {
      projectId,
      ...(input.discoverySessionId && { discoverySessionId: input.discoverySessionId }),
      ...(input.requirementIds?.length && { id: { in: input.requirementIds } }),
    },
    take: 50,
  })

  if (requirements.length === 0) {
    throw Errors.validation('No requirements found')
  }

  const moduleRecs = await prisma.moduleRecommendationAnalysis.findMany({
    where: { projectId },
    select: { moduleName: true },
  })

  const discoveryAnswers = input.discoverySessionId
    ? await prisma.discoveryAnswer.findMany({
        where: { discoverySessionId: input.discoverySessionId },
        include: { question: { select: { question: true, category: true } } },
        take: 30,
      })
    : []

  let results
  try {
    results = await generateFitGap(
      requirements.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
        category: r.category,
      })),
      {
        projectName: project.name,
        projectType: project.projectType,
        moduleRecommendations: moduleRecs.map((m) => m.moduleName),
        discoveryAnswers: discoveryAnswers.map((a) => ({
          question: a.question.question,
          answer: a.answer,
          category: a.question.category,
        })),
      }
    )
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  await prisma.fitGapAnalysis.deleteMany({
    where: { requirementId: { in: requirements.map((r) => r.id) }, projectId },
  })

  await prisma.fitGapAnalysis.createMany({
    data: results.map((r) => ({
      organizationId,
      projectId,
      requirementId: r.requirementId,
      fitCategory: r.fitCategory as any,
      rationale: r.rationale,
      recommendation: r.recommendation,
      implementationImpact: r.implementationImpact,
      assumptions: r.assumptions,
      risks: r.risks,
      confidenceScore: r.confidenceScore,
      generatedByAgent: 'FunctionalAgent',
      generatedBySkill: 'generate-fit-gap',
    })),
  })

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      projectId,
      organizationId,
      discoverySessionId: input.discoverySessionId ?? null,
      outputType: 'FIT_GAP_DRAFT',
      title: 'Fit-Gap Analysis',
      content: JSON.stringify(results),
      generatedByAgent: 'FunctionalAgent',
      generatedBySkill: 'generate-fit-gap',
      confidenceScore:
        results.reduce((sum, r) => sum + (r.confidenceScore ?? 0), 0) / (results.length || 1),
      createdBy: actorId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'FitGapAnalysis',
    entityId: output.id,
    action: 'CREATE',
    afterData: { analysisCount: results.length },
  })

  return { analysisCount: results.length, generatedOutputId: output.id }
}

export async function listFitGapAnalyses(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; fitCategory?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.fitCategory && { fitCategory: query.fitCategory as any }),
  }

  const [total, analyses] = await prisma.$transaction([
    prisma.fitGapAnalysis.count({ where }),
    prisma.fitGapAnalysis.findMany({
      where,
      include: {
        requirement: { select: { id: true, title: true, priority: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { analyses, meta: paginationMeta(total, page, perPage) }
}

// ── AI UAT Generation ──────────────────────────────────────────────────────────

export async function runUatGeneration(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunUatInput
) {
  const project = await validateProjectAccess(organizationId, projectId)

  const workstream = input.workstreamId
    ? await prisma.functionalWorkstream.findFirst({
        where: { id: input.workstreamId, projectId },
      })
    : null

  const process = input.processId
    ? await prisma.businessProcess.findFirst({
        where: { id: input.processId, projectId },
        include: { steps: { orderBy: { stepOrder: 'asc' } } },
      })
    : null

  const [requirements, fitGapItems] = await Promise.all([
    prisma.requirement.findMany({ where: { projectId }, take: 50 }),
    prisma.fitGapAnalysis.findMany({
      where: { projectId },
      include: { requirement: { select: { title: true } } },
      take: 20,
    }),
  ])

  let results
  try {
    results = await generateUatScenarios({
      projectName: project.name,
      projectType: project.projectType,
      workstreamName: workstream?.name,
      processName: process?.processName,
      requirements: requirements.map((r) => ({
        title: r.title,
        description: r.description,
        priority: r.priority,
      })),
      fitGapItems: fitGapItems.map((f) => ({
        requirementTitle: f.requirement.title,
        fitCategory: f.fitCategory,
        recommendation: f.recommendation ?? '',
      })),
      scenarioCount: input.scenarioCount,
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  await prisma.uatScenario.createMany({
    data: results.map((r) => ({
      organizationId,
      projectId,
      workstreamId: input.workstreamId ?? null,
      title: r.title,
      category: r.category as any,
      precondition: r.precondition,
      testSteps: r.testSteps,
      expectedResult: r.expectedResult,
      affectedModule: r.affectedModule,
      businessObjective: r.businessObjective,
      generatedByAgent: 'FunctionalAgent',
      generatedBySkill: 'generate-uat',
    })),
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'UatScenario',
    entityId: projectId,
    action: 'CREATE',
    afterData: { scenarioCount: results.length },
  })

  return { scenarioCount: results.length }
}

export async function listUatScenarios(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; category?: string; workstreamId?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.category && { category: query.category as any }),
    ...(query.workstreamId && { workstreamId: query.workstreamId }),
  }

  const [total, scenarios] = await prisma.$transaction([
    prisma.uatScenario.count({ where }),
    prisma.uatScenario.findMany({
      where,
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
      skip,
      take: perPage,
    }),
  ])

  return { scenarios, meta: paginationMeta(total, page, perPage) }
}

export async function updateUatScenario(
  organizationId: string,
  projectId: string,
  scenarioId: string,
  actorId: string,
  input: UpdateUatScenarioInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.uatScenario.findFirst({
    where: { id: scenarioId, projectId },
  })
  if (!existing) throw Errors.notFound('UatScenario')

  const scenario = await prisma.uatScenario.update({
    where: { id: scenarioId },
    data: { ...input, updatedAt: new Date() },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'UatScenario',
    entityId: scenarioId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: scenario.status },
  })

  return scenario
}

// ── AI SOP Generation ──────────────────────────────────────────────────────────

export async function runSopGeneration(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: RunSopInput
) {
  const project = await validateProjectAccess(organizationId, projectId)

  const process = await prisma.businessProcess.findFirst({
    where: { id: input.processId, projectId },
    include: {
      workstream: true,
      steps: { orderBy: { stepOrder: 'asc' } },
    },
  })

  if (!process) throw Errors.notFound('BusinessProcess')

  let result
  try {
    result = await generateSop({
      processName: process.processName,
      processCategory: process.processCategory,
      projectName: project.name,
      currentState: process.currentState ?? undefined,
      futureState: process.futureState ?? undefined,
      affectedModules: process.impactedModules as string[],
      workstreamName: process.workstream?.name,
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw Errors.internal((err as Error).message)
  }

  const sop = await prisma.sopDocument.create({
    data: {
      organizationId,
      projectId,
      workstreamId: process.workstreamId ?? null,
      title: result.title,
      purpose: result.purpose,
      scope: result.scope,
      responsibilities: result.responsibilities,
      processSteps: result.processSteps,
      approvalFlow: result.approvalFlow,
      exceptionHandling: result.exceptionHandling,
      generatedByAgent: 'FunctionalAgent',
      generatedBySkill: 'generate-sop',
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'SopDocument',
    entityId: sop.id,
    action: 'CREATE',
    afterData: { title: sop.title, processId: input.processId },
  })

  return sop
}

export async function listSopDocuments(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; workstreamId?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.workstreamId && { workstreamId: query.workstreamId }),
  }

  const [total, sops] = await prisma.$transaction([
    prisma.sopDocument.count({ where }),
    prisma.sopDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { sops, meta: paginationMeta(total, page, perPage) }
}

export async function updateSopDocument(
  organizationId: string,
  projectId: string,
  sopId: string,
  actorId: string,
  input: UpdateSopInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.sopDocument.findFirst({
    where: { id: sopId, projectId },
  })
  if (!existing) throw Errors.notFound('SopDocument')

  const shouldIncrementVersion = input.processSteps !== undefined || input.purpose !== undefined
  const updates: any = { ...input, updatedAt: new Date() }
  if (shouldIncrementVersion) updates.version = { increment: 1 }

  const sop = await prisma.sopDocument.update({
    where: { id: sopId },
    data: updates,
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'SopDocument',
    entityId: sopId,
    action: 'UPDATE',
    beforeData: { status: existing.status, version: existing.version },
    afterData: { status: sop.status, version: sop.version },
  })

  return sop
}

// ── Functional Deliverables ────────────────────────────────────────────────────

export async function listDeliverables(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    deliverableType?: string
    status?: string
    workstreamId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.deliverableType && { deliverableType: query.deliverableType as any }),
    ...(query.status && { status: query.status as any }),
    ...(query.workstreamId && { workstreamId: query.workstreamId }),
  }

  const [total, deliverables] = await prisma.$transaction([
    prisma.functionalDeliverable.count({ where }),
    prisma.functionalDeliverable.findMany({
      where,
      orderBy: [{ deliverableType: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { deliverables, meta: paginationMeta(total, page, perPage) }
}

export async function createDeliverable(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateDeliverableInput
) {
  await validateProjectAccess(organizationId, projectId)

  const deliverable = await prisma.functionalDeliverable.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'FunctionalDeliverable',
    entityId: deliverable.id,
    action: 'CREATE',
    afterData: { title: deliverable.title, deliverableType: deliverable.deliverableType },
  })

  return deliverable
}
