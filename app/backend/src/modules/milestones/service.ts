import type { CreateMilestoneInput, UpdateMilestoneInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listMilestones(organizationId: string, projectId: string) {
  await validateProjectAccess(organizationId, projectId)
  return prisma.projectMilestone.findMany({
    where: { projectId },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { targetDate: 'asc' },
  })
}

export async function getMilestone(organizationId: string, projectId: string, milestoneId: string) {
  await validateProjectAccess(organizationId, projectId)
  const milestone = await prisma.projectMilestone.findFirst({
    where: { id: milestoneId, projectId },
    include: { owner: { select: { id: true, name: true } } },
  })
  if (!milestone) throw Errors.notFound('Milestone')
  return milestone
}

export async function createMilestone(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateMilestoneInput
) {
  await validateProjectAccess(organizationId, projectId)

  const milestone = await prisma.projectMilestone.create({
    data: {
      ...input,
      projectId,
      createdBy: actorId,
      targetDate: new Date(input.targetDate),
    },
    include: { owner: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectMilestone',
    entityId: milestone.id,
    action: 'CREATE',
    afterData: { name: milestone.name, targetDate: milestone.targetDate },
  })

  return milestone
}

export async function updateMilestone(
  organizationId: string,
  projectId: string,
  milestoneId: string,
  actorId: string,
  input: UpdateMilestoneInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.projectMilestone.findFirst({ where: { id: milestoneId, projectId } })
  if (!existing) throw Errors.notFound('Milestone')

  const milestone = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: {
      ...input,
      targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      actualDate: input.actualDate !== undefined ? (input.actualDate ? new Date(input.actualDate) : null) : undefined,
    },
    include: { owner: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectMilestone',
    entityId: milestoneId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: milestone.status },
  })

  return milestone
}

export async function deleteMilestone(
  organizationId: string,
  projectId: string,
  milestoneId: string,
  actorId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.projectMilestone.findFirst({ where: { id: milestoneId, projectId } })
  if (!existing) throw Errors.notFound('Milestone')

  await prisma.projectMilestone.delete({ where: { id: milestoneId } })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectMilestone',
    entityId: milestoneId,
    action: 'DELETE',
    beforeData: { name: existing.name },
  })
}
