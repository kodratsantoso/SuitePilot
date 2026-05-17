import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import type {
  CreateHypercareTaskInput,
  UpdateHypercareTaskInput,
  CreateIssueInput,
  UpdateIssueInput,
  UpdateGoLiveItemInput,
  BulkCreateGoLiveInput,
  CreateChangeRequestInput,
  UpdateChangeRequestInput,
  CreateRiskInput,
  UpdateRiskInput,
} from './schema.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

// ── Hypercare Tasks ────────────────────────────────────────────────────────────

export async function listHypercareTasks(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; priority?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.priority && { priority: query.priority as any }),
  }

  const [total, tasks] = await prisma.$transaction([
    prisma.hypercareTask.count({ where }),
    prisma.hypercareTask.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { tasks, meta: paginationMeta(total, page, perPage) }
}

export async function createHypercareTask(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateHypercareTaskInput
) {
  await validateProjectAccess(organizationId, projectId)

  const task = await prisma.hypercareTask.create({
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
    entityType: 'HypercareTask',
    entityId: task.id,
    action: 'CREATE',
    afterData: { title: task.title, status: task.status, priority: task.priority },
  })

  return task
}

export async function updateHypercareTask(
  organizationId: string,
  projectId: string,
  taskId: string,
  actorId: string,
  input: UpdateHypercareTaskInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.hypercareTask.findFirst({
    where: { id: taskId, projectId },
  })
  if (!existing) throw Errors.notFound('HypercareTask')

  const task = await prisma.hypercareTask.update({
    where: { id: taskId },
    data: {
      ...input,
      completedAt:
        input.status === 'DONE' && !existing.completedAt
          ? new Date()
          : input.completedAt !== undefined
            ? input.completedAt
              ? new Date(input.completedAt)
              : null
            : undefined,
      updatedAt: new Date(),
    },
    include: {
      owner: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'HypercareTask',
    entityId: taskId,
    action: 'UPDATE',
    beforeData: { status: existing.status, priority: existing.priority },
    afterData: { status: task.status, priority: task.priority },
  })

  return task
}

export async function deleteHypercareTask(
  organizationId: string,
  projectId: string,
  taskId: string,
  actorId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.hypercareTask.findFirst({
    where: { id: taskId, projectId },
  })
  if (!existing) throw Errors.notFound('HypercareTask')

  await prisma.hypercareTask.delete({ where: { id: taskId } })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'HypercareTask',
    entityId: taskId,
    action: 'DELETE',
    beforeData: { title: existing.title, status: existing.status },
  })
}

// ── Issues ─────────────────────────────────────────────────────────────────────

export async function listIssues(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    status?: string
    severity?: string
    hypercareTaskId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.severity && { severity: query.severity as any }),
    ...(query.hypercareTaskId && { hypercareTaskId: query.hypercareTaskId }),
  }

  const [total, issues] = await prisma.$transaction([
    prisma.issue.count({ where }),
    prisma.issue.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { issues, meta: paginationMeta(total, page, perPage) }
}

export async function createIssue(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateIssueInput
) {
  await validateProjectAccess(organizationId, projectId)

  const issue = await prisma.issue.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'Issue',
    entityId: issue.id,
    action: 'CREATE',
    afterData: { title: issue.title, status: issue.status, severity: issue.severity },
  })

  return issue
}

export async function updateIssue(
  organizationId: string,
  projectId: string,
  issueId: string,
  actorId: string,
  input: UpdateIssueInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.issue.findFirst({
    where: { id: issueId, projectId },
  })
  if (!existing) throw Errors.notFound('Issue')

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: {
      ...input,
      resolvedAt:
        input.status === 'RESOLVED' && !existing.resolvedAt
          ? new Date()
          : input.resolvedAt !== undefined
            ? input.resolvedAt
              ? new Date(input.resolvedAt)
              : null
            : undefined,
      updatedAt: new Date(),
    },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'Issue',
    entityId: issueId,
    action: 'UPDATE',
    beforeData: { status: existing.status, severity: existing.severity },
    afterData: { status: issue.status, severity: issue.severity },
  })

  return issue
}

export async function deleteIssue(
  organizationId: string,
  projectId: string,
  issueId: string,
  actorId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.issue.findFirst({
    where: { id: issueId, projectId },
  })
  if (!existing) throw Errors.notFound('Issue')

  await prisma.issue.delete({ where: { id: issueId } })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'Issue',
    entityId: issueId,
    action: 'DELETE',
    beforeData: { title: existing.title, status: existing.status },
  })
}

// ── Go-Live Readiness ──────────────────────────────────────────────────────────

export async function listGoLiveItems(
  organizationId: string,
  projectId: string,
  query: { status?: string }
) {
  await validateProjectAccess(organizationId, projectId)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
  }

  const items = await prisma.goLiveReadiness.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  })

  return items
}

export async function updateGoLiveItem(
  organizationId: string,
  projectId: string,
  itemId: string,
  actorId: string,
  input: UpdateGoLiveItemInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.goLiveReadiness.findFirst({
    where: { id: itemId, projectId },
  })
  if (!existing) throw Errors.notFound('GoLiveReadiness')

  const item = await prisma.goLiveReadiness.update({
    where: { id: itemId },
    data: { ...input, updatedAt: new Date() },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'GoLiveReadiness',
    entityId: itemId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: item.status },
  })

  return item
}

export async function bulkCreateGoLiveItems(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: BulkCreateGoLiveInput
) {
  await validateProjectAccess(organizationId, projectId)

  await prisma.goLiveReadiness.createMany({
    data: input.items.map((item) => ({
      organizationId,
      projectId,
      checklistItem: item.checklistItem,
    })),
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'GoLiveReadiness',
    action: 'CREATE',
    afterData: { count: input.items.length },
  })

  return prisma.goLiveReadiness.findMany({
    where: { projectId, organizationId },
    orderBy: { createdAt: 'asc' },
  })
}

// ── Change Requests ────────────────────────────────────────────────────────────

export async function listChangeRequests(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; priority?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.priority && { priority: query.priority as any }),
  }

  const [total, changeRequests] = await prisma.$transaction([
    prisma.changeRequest.count({ where }),
    prisma.changeRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { changeRequests, meta: paginationMeta(total, page, perPage) }
}

export async function createChangeRequest(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateChangeRequestInput
) {
  await validateProjectAccess(organizationId, projectId)

  const changeRequest = await prisma.changeRequest.create({
    data: {
      ...input,
      projectId,
      organizationId,
      requestedBy: actorId,
    },
    include: {
      requester: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ChangeRequest',
    entityId: changeRequest.id,
    action: 'CREATE',
    afterData: { title: changeRequest.title, status: changeRequest.status, priority: changeRequest.priority },
  })

  return changeRequest
}

export async function updateChangeRequest(
  organizationId: string,
  projectId: string,
  changeId: string,
  actorId: string,
  input: UpdateChangeRequestInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.changeRequest.findFirst({
    where: { id: changeId, projectId },
  })
  if (!existing) throw Errors.notFound('ChangeRequest')

  const changeRequest = await prisma.changeRequest.update({
    where: { id: changeId },
    data: {
      ...input,
      resolvedAt:
        input.status === 'IMPLEMENTED' && !existing.resolvedAt
          ? new Date()
          : input.resolvedAt !== undefined
            ? input.resolvedAt
              ? new Date(input.resolvedAt)
              : null
            : undefined,
      updatedAt: new Date(),
    },
    include: {
      requester: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ChangeRequest',
    entityId: changeId,
    action: 'UPDATE',
    beforeData: { status: existing.status, priority: existing.priority },
    afterData: { status: changeRequest.status, priority: changeRequest.priority },
  })

  return changeRequest
}

// ── Post-Implementation Risks ──────────────────────────────────────────────────

export async function listRisks(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; severity?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.severity && { severity: query.severity as any }),
  }

  const [total, risks] = await prisma.$transaction([
    prisma.postImplementationRisk.count({ where }),
    prisma.postImplementationRisk.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { risks, meta: paginationMeta(total, page, perPage) }
}

export async function createRisk(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateRiskInput
) {
  await validateProjectAccess(organizationId, projectId)

  const risk = await prisma.postImplementationRisk.create({
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
    entityType: 'PostImplementationRisk',
    entityId: risk.id,
    action: 'CREATE',
    afterData: { severity: risk.severity, status: risk.status },
  })

  return risk
}

export async function updateRisk(
  organizationId: string,
  projectId: string,
  riskId: string,
  actorId: string,
  input: UpdateRiskInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.postImplementationRisk.findFirst({
    where: { id: riskId, projectId },
  })
  if (!existing) throw Errors.notFound('PostImplementationRisk')

  const risk = await prisma.postImplementationRisk.update({
    where: { id: riskId },
    data: { ...input, updatedAt: new Date() },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'PostImplementationRisk',
    entityId: riskId,
    action: 'UPDATE',
    beforeData: { status: existing.status, severity: existing.severity },
    afterData: { status: risk.status, severity: risk.severity },
  })

  return risk
}
