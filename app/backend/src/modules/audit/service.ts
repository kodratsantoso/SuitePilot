import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

export async function listAuditLogs(
  organizationId: string,
  query: {
    page?: string
    perPage?: string
    projectId?: string
    entityType?: string
    action?: string
    from?: string
    to?: string
  }
) {
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    organizationId,
    ...(query.projectId && { projectId: query.projectId }),
    ...(query.entityType && { entityType: query.entityType }),
    ...(query.action && { action: query.action as any }),
    ...((query.from || query.to) && {
      createdAt: {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      },
    }),
  }

  const [total, logs] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { logs, meta: paginationMeta(total, page, perPage) }
}

export async function listProjectAuditLogs(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; entityType?: string; action?: string }
) {
  // Validate project belongs to org
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')

  return listAuditLogs(organizationId, { ...query, projectId })
}
