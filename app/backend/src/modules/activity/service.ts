import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'

export interface ActivityItem {
  id: string
  actor: { id: string; name: string } | null
  action: string
  entityType: string
  entityId: string | null
  description: string
  createdAt: string
}

function formatDescription(action: string, entityType: string, afterData: unknown): string {
  const verb =
    action === 'CREATE'
      ? 'created'
      : action === 'UPDATE'
        ? 'updated'
        : action === 'DELETE'
          ? 'deleted'
          : action === 'LOGIN'
            ? 'logged in'
            : action.toLowerCase() + 'd'

  const entity = entityType
    .replace('Project', '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()

  // Try to extract a name/title from afterData
  const data = afterData as Record<string, unknown> | null | undefined
  const label = data?.title ?? data?.name ?? data?.code ?? null
  return label ? `${verb} ${entity}: "${String(label)}"` : `${verb} ${entity}`
}

export async function listProjectActivity(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string }
) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')

  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
  const perPage = Math.min(100, parseInt(query.perPage ?? '30', 10) || 30)
  const skip = (page - 1) * perPage

  const [total, logs] = await prisma.$transaction([
    prisma.auditLog.count({ where: { projectId, organizationId } }),
    prisma.auditLog.findMany({
      where: { projectId, organizationId },
      include: { actor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  const items: ActivityItem[] = logs.map((log) => ({
    id: log.id,
    actor: log.actor ? { id: log.actor.id, name: log.actor.name } : null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    description: formatDescription(log.action, log.entityType, log.afterData),
    createdAt: log.createdAt.toISOString(),
  }))

  return {
    items,
    meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  }
}
