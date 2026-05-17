import type { CreatePainPointInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listPainPoints(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    severity?: string
    discoverySessionId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    projectId,
    ...(query.severity && { severity: query.severity as any }),
    ...(query.discoverySessionId && { discoverySessionId: query.discoverySessionId }),
  }

  const [total, painPoints] = await prisma.$transaction([
    prisma.painPoint.count({ where }),
    prisma.painPoint.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { painPoints, meta: paginationMeta(total, page, perPage) }
}

export async function createPainPoint(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreatePainPointInput
) {
  await validateProjectAccess(organizationId, projectId)

  const painPoint = await prisma.painPoint.create({
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
    entityType: 'PainPoint',
    entityId: painPoint.id,
    action: 'CREATE',
    afterData: { title: painPoint.title, severity: painPoint.severity },
  })

  return painPoint
}
