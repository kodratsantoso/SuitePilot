import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'

export async function getOrganization(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { _count: { select: { users: true, customers: true, projects: true } } },
  })
  if (!org) throw Errors.notFound('Organization')
  return org
}

export async function updateOrganization(
  organizationId: string,
  actorId: string,
  data: { name?: string }
) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) throw Errors.notFound('Organization')

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data,
  })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'Organization',
    entityId: organizationId,
    action: 'UPDATE',
    beforeData: { name: org.name },
    afterData: { name: updated.name },
  })

  return updated
}

export async function listOrganizationMembers(organizationId: string) {
  return prisma.user.findMany({
    where: { organizationId, status: { not: 'INACTIVE' } },
    select: { id: true, name: true, email: true, status: true, lastLoginAt: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
}
