import type { CreateRaidInput, UpdateRaidInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function getRaidItem(organizationId: string, projectId: string, raidId: string) {
  await validateProjectAccess(organizationId, projectId)
  const item = await prisma.raidItem.findFirst({
    where: { id: raidId, projectId },
    include: { owner: { select: { id: true, name: true } } },
  })
  if (!item) throw Errors.notFound('RAID item')
  return item
}

export async function listRaidItems(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; type?: string; status?: string; severity?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    projectId,
    ...(query.type && { type: query.type as any }),
    ...(query.status && { status: query.status as any }),
    ...(query.severity && { severity: query.severity as any }),
  }

  const [total, items] = await prisma.$transaction([
    prisma.raidItem.count({ where }),
    prisma.raidItem.findMany({
      where,
      include: { owner: { select: { id: true, name: true } } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { items, meta: paginationMeta(total, page, perPage) }
}

export async function createRaidItem(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateRaidInput
) {
  await validateProjectAccess(organizationId, projectId)

  const item = await prisma.raidItem.create({
    data: {
      ...input,
      projectId,
      createdBy: actorId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: { owner: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'RaidItem',
    entityId: item.id,
    action: 'CREATE',
    afterData: { type: item.type, title: item.title, status: item.status },
  })

  return item
}

export async function updateRaidItem(
  organizationId: string,
  projectId: string,
  raidId: string,
  actorId: string,
  input: UpdateRaidInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.raidItem.findFirst({ where: { id: raidId, projectId } })
  if (!existing) throw Errors.notFound('RAID item')

  const item = await prisma.raidItem.update({
    where: { id: raidId },
    data: {
      ...input,
      updatedBy: actorId,
      dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
    },
    include: { owner: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'RaidItem',
    entityId: raidId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: item.status },
  })

  return item
}

export async function deleteRaidItem(
  organizationId: string,
  projectId: string,
  raidId: string,
  actorId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.raidItem.findFirst({ where: { id: raidId, projectId } })
  if (!existing) throw Errors.notFound('RAID item')

  await prisma.raidItem.delete({ where: { id: raidId } })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'RaidItem',
    entityId: raidId,
    action: 'DELETE',
    beforeData: { type: existing.type, title: existing.title },
  })
}
