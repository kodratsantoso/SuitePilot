import type { CreateRequirementInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listRequirements(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    priority?: string
    source?: string
    category?: string
    discoverySessionId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    projectId,
    ...(query.priority && { priority: query.priority as any }),
    ...(query.source && { source: query.source as any }),
    ...(query.category && { category: query.category as any }),
    ...(query.discoverySessionId && { discoverySessionId: query.discoverySessionId }),
  }

  const [total, requirements] = await prisma.$transaction([
    prisma.requirement.count({ where }),
    prisma.requirement.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { requirements, meta: paginationMeta(total, page, perPage) }
}

export async function createRequirement(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateRequirementInput
) {
  await validateProjectAccess(organizationId, projectId)

  const requirement = await prisma.requirement.create({
    data: {
      ...input,
      projectId,
      organizationId,
      createdBy: actorId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'Requirement',
    entityId: requirement.id,
    action: 'CREATE',
    afterData: { title: requirement.title, priority: requirement.priority, source: requirement.source },
  })

  return requirement
}
