import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import type {
  CreateGovernanceEventInput,
  CreateValidationInput,
  CreateReviewGateInput,
  UpdateReviewGateInput,
} from './schema.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

function computeRagStatus(confidence?: number | null, quality?: number | null): 'GREEN' | 'AMBER' | 'RED' {
  const c = confidence ?? 50
  const q = quality ?? 50
  if (c >= 70 && q >= 70) return 'GREEN'
  if (c >= 40 && q >= 40) return 'AMBER'
  return 'RED'
}

// ── Governance Events ──────────────────────────────────────────────────────────

export async function listGovernanceEvents(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    eventType?: string
    ragStatus?: string
    aiGeneratedOutputId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.eventType && { eventType: query.eventType as any }),
    ...(query.ragStatus && { ragStatus: query.ragStatus as any }),
    ...(query.aiGeneratedOutputId && { aiGeneratedOutputId: query.aiGeneratedOutputId }),
  }

  const [total, events] = await prisma.$transaction([
    prisma.governanceEvent.count({ where }),
    prisma.governanceEvent.findMany({
      where,
      include: {
        output: { select: { id: true, title: true, outputType: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { events, meta: paginationMeta(total, page, perPage) }
}

export async function createGovernanceEvent(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateGovernanceEventInput
) {
  await validateProjectAccess(organizationId, projectId)

  const ragStatus = input.ragStatus ?? computeRagStatus(input.confidenceScore, input.qualityScore)

  const event = await prisma.governanceEvent.create({
    data: {
      ...input,
      ragStatus,
      projectId,
      organizationId,
    },
    include: {
      output: { select: { id: true, title: true, outputType: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'GovernanceEvent',
    entityId: event.id,
    action: 'CREATE',
    afterData: {
      eventType: event.eventType,
      ragStatus: event.ragStatus,
      severity: event.severity,
      qualityScore: event.qualityScore,
      confidenceScore: event.confidenceScore,
    },
  })

  return event
}

// ── Output Validations ─────────────────────────────────────────────────────────

export async function listValidations(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    result?: string
    validationType?: string
    aiGeneratedOutputId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.result && { result: query.result as any }),
    ...(query.validationType && { validationType: query.validationType as any }),
    ...(query.aiGeneratedOutputId && { aiGeneratedOutputId: query.aiGeneratedOutputId }),
  }

  const [total, validations] = await prisma.$transaction([
    prisma.outputValidation.count({ where }),
    prisma.outputValidation.findMany({
      where,
      include: {
        output: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { validations, meta: paginationMeta(total, page, perPage) }
}

export async function createValidation(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateValidationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const validation = await prisma.outputValidation.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
    include: {
      output: { select: { id: true, title: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'OutputValidation',
    entityId: validation.id,
    action: 'CREATE',
    afterData: {
      validationType: validation.validationType,
      result: validation.result,
      aiGeneratedOutputId: validation.aiGeneratedOutputId,
    },
  })

  return validation
}

// ── Review Gates ───────────────────────────────────────────────────────────────

export async function listReviewGates(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    stage?: string
    status?: string
    aiGeneratedOutputId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.stage && { stage: query.stage as any }),
    ...(query.status && { status: query.status as any }),
    ...(query.aiGeneratedOutputId && { aiGeneratedOutputId: query.aiGeneratedOutputId }),
  }

  const [total, gates] = await prisma.$transaction([
    prisma.reviewGateStatus.count({ where }),
    prisma.reviewGateStatus.findMany({
      where,
      include: {
        output: { select: { id: true, title: true, outputType: true, status: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { gates, meta: paginationMeta(total, page, perPage) }
}

export async function createReviewGate(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateReviewGateInput
) {
  await validateProjectAccess(organizationId, projectId)

  const gate = await prisma.reviewGateStatus.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
    include: {
      output: { select: { id: true, title: true, outputType: true, status: true } },
      reviewer: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ReviewGateStatus',
    entityId: gate.id,
    action: 'CREATE',
    afterData: {
      stage: gate.stage,
      status: gate.status,
      aiGeneratedOutputId: gate.aiGeneratedOutputId,
    },
  })

  return gate
}

export async function updateReviewGate(
  organizationId: string,
  projectId: string,
  gateId: string,
  actorId: string,
  input: UpdateReviewGateInput
) {
  const existing = await prisma.reviewGateStatus.findFirst({
    where: { id: gateId },
    include: { output: { select: { projectId: true, organizationId: true } } },
  })

  if (!existing) throw Errors.notFound('ReviewGateStatus')
  if (existing.output.projectId !== projectId || existing.output.organizationId !== organizationId) {
    throw Errors.notFound('ReviewGateStatus')
  }

  const gate = await prisma.reviewGateStatus.update({
    where: { id: gateId },
    data: {
      status: input.status,
      notes: input.notes,
      reviewerId: actorId,
    },
    include: {
      output: { select: { id: true, title: true, outputType: true, status: true } },
      reviewer: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ReviewGateStatus',
    entityId: gateId,
    action: 'UPDATE',
    beforeData: { status: existing.status, notes: existing.notes, reviewerId: existing.reviewerId },
    afterData: { status: gate.status, notes: gate.notes, reviewerId: gate.reviewerId },
  })

  return gate
}

// ── RAG Status (computed, no DB write) ────────────────────────────────────────

export async function getProjectRagStatus(organizationId: string, projectId: string) {
  await validateProjectAccess(organizationId, projectId)

  const outputs = await prisma.aiGeneratedOutput.findMany({
    where: { projectId, organizationId },
    include: {
      governanceEvents: { orderBy: { createdAt: 'desc' }, take: 1 },
      outputValidations: true,
      reviewGates: { orderBy: { createdAt: 'desc' }, take: 4 },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const ragItems = outputs.map((output) => {
    const latestEvent = output.governanceEvents[0]
    const failedValidations = output.outputValidations.filter((v) => v.result === 'FAIL').length
    const warningValidations = output.outputValidations.filter((v) => v.result === 'WARNING').length
    const hasRejectedGate = output.reviewGates.some((g) => g.status === 'REJECTED')
    const hasHallucination = output.governanceEvents.some((e) => e.eventType === 'HALLUCINATION_DETECTED')

    let rag: 'GREEN' | 'AMBER' | 'RED' = 'AMBER'
    if (
      hasHallucination ||
      failedValidations > 0 ||
      hasRejectedGate ||
      (output.confidenceScore !== null && output.confidenceScore < 40)
    ) {
      rag = 'RED'
    } else if (
      failedValidations === 0 &&
      warningValidations === 0 &&
      !hasRejectedGate &&
      (output.confidenceScore === null || output.confidenceScore >= 70)
    ) {
      const latestQuality = latestEvent?.qualityScore
      if (latestQuality === null || latestQuality === undefined || latestQuality >= 70) rag = 'GREEN'
    }

    return {
      outputId: output.id,
      outputTitle: output.title,
      outputType: output.outputType,
      outputStatus: output.status,
      confidenceScore: output.confidenceScore,
      latestQualityScore: latestEvent?.qualityScore ?? null,
      ragStatus: rag,
      validationSummary: {
        pass: output.outputValidations.filter((v) => v.result === 'PASS').length,
        warning: warningValidations,
        fail: failedValidations,
      },
      reviewGateCount: output.reviewGates.length,
      hasHallucination,
      latestEventType: latestEvent?.eventType ?? null,
    }
  })

  const summary = {
    total: ragItems.length,
    green: ragItems.filter((r) => r.ragStatus === 'GREEN').length,
    amber: ragItems.filter((r) => r.ragStatus === 'AMBER').length,
    red: ragItems.filter((r) => r.ragStatus === 'RED').length,
  }

  return { summary, items: ragItems }
}
