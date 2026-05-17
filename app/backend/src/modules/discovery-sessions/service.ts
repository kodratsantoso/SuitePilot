import type { CreateDiscoverySessionInput, UpdateDiscoverySessionInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listDiscoverySessions(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    projectId,
    ...(query.status && { status: query.status as any }),
  }

  const [total, sessions] = await prisma.$transaction([
    prisma.discoverySession.count({ where }),
    prisma.discoverySession.findMany({
      where,
      include: {
        _count: { select: { questions: true, requirements: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { sessions, meta: paginationMeta(total, page, perPage) }
}

export async function getDiscoverySession(
  organizationId: string,
  projectId: string,
  sessionId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const session = await prisma.discoverySession.findFirst({
    where: { id: sessionId, projectId },
    include: {
      questions: {
        include: {
          _count: { select: { answers: true } },
        },
        orderBy: { order: 'asc' },
      },
      requirements: true,
      painPoints: true,
      assumptions: true,
      discoveryRisks: true,
      _count: { select: { generatedOutputs: true } },
    },
  })
  if (!session) throw Errors.notFound('DiscoverySession')
  return session
}

export async function createDiscoverySession(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateDiscoverySessionInput
) {
  await validateProjectAccess(organizationId, projectId)

  const startedAt =
    input.status === 'ACTIVE'
      ? (input.startedAt ? new Date(input.startedAt) : new Date())
      : input.startedAt
        ? new Date(input.startedAt)
        : undefined

  const session = await prisma.discoverySession.create({
    data: {
      ...input,
      projectId,
      organizationId,
      createdBy: actorId,
      startedAt,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'DiscoverySession',
    entityId: session.id,
    action: 'CREATE',
    afterData: { title: session.title, status: session.status },
  })

  return session
}

export async function updateDiscoverySession(
  organizationId: string,
  projectId: string,
  sessionId: string,
  actorId: string,
  input: UpdateDiscoverySessionInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.discoverySession.findFirst({ where: { id: sessionId, projectId } })
  if (!existing) throw Errors.notFound('DiscoverySession')

  const session = await prisma.discoverySession.update({
    where: { id: sessionId },
    data: {
      ...input,
      updatedBy: actorId,
      startedAt:
        input.startedAt !== undefined
          ? input.startedAt
            ? new Date(input.startedAt)
            : null
          : undefined,
      completedAt:
        input.completedAt !== undefined
          ? input.completedAt
            ? new Date(input.completedAt)
            : null
          : undefined,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'DiscoverySession',
    entityId: sessionId,
    action: 'UPDATE',
    beforeData: { title: existing.title, status: existing.status },
    afterData: { title: session.title, status: session.status },
  })

  return session
}

export async function deleteDiscoverySession(
  organizationId: string,
  projectId: string,
  sessionId: string,
  actorId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.discoverySession.findFirst({ where: { id: sessionId, projectId } })
  if (!existing) throw Errors.notFound('DiscoverySession')

  await prisma.discoverySession.delete({ where: { id: sessionId } })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'DiscoverySession',
    entityId: sessionId,
    action: 'DELETE',
    beforeData: { title: existing.title },
  })
}
