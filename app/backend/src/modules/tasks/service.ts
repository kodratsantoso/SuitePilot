import type { CreateTaskInput, UpdateTaskInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listTasks(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; priority?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    projectId,
    ...(query.status && { status: query.status as any }),
    ...(query.priority && { priority: query.priority as any }),
  }

  const [total, tasks] = await prisma.$transaction([
    prisma.projectTask.count({ where }),
    prisma.projectTask.findMany({
      where,
      include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { tasks, meta: paginationMeta(total, page, perPage) }
}

export async function getTask(organizationId: string, projectId: string, taskId: string) {
  await validateProjectAccess(organizationId, projectId)
  const task = await prisma.projectTask.findFirst({
    where: { id: taskId, projectId },
    include: { owner: { select: { id: true, name: true } } },
  })
  if (!task) throw Errors.notFound('Task')
  return task
}

export async function createTask(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateTaskInput
) {
  await validateProjectAccess(organizationId, projectId)

  const task = await prisma.projectTask.create({
    data: {
      ...input,
      projectId,
      createdBy: actorId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: { owner: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectTask',
    entityId: task.id,
    action: 'CREATE',
    afterData: { title: task.title, status: task.status },
  })

  return task
}

export async function updateTask(
  organizationId: string,
  projectId: string,
  taskId: string,
  actorId: string,
  input: UpdateTaskInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.projectTask.findFirst({ where: { id: taskId, projectId } })
  if (!existing) throw Errors.notFound('Task')

  const task = await prisma.projectTask.update({
    where: { id: taskId },
    data: {
      ...input,
      updatedBy: actorId,
      startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : undefined,
      dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
      completedDate: input.completedDate !== undefined ? (input.completedDate ? new Date(input.completedDate) : null) : undefined,
    },
    include: { owner: { select: { id: true, name: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectTask',
    entityId: taskId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: task.status },
  })

  return task
}

export async function deleteTask(
  organizationId: string,
  projectId: string,
  taskId: string,
  actorId: string
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.projectTask.findFirst({ where: { id: taskId, projectId } })
  if (!existing) throw Errors.notFound('Task')

  await prisma.projectTask.delete({ where: { id: taskId } })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ProjectTask',
    entityId: taskId,
    action: 'DELETE',
    beforeData: { title: existing.title },
  })
}
