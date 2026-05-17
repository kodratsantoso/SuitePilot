import type { CreateProjectInput, UpdateProjectInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

const PROJECT_SELECT = {
  id: true,
  organizationId: true,
  projectCode: true,
  name: true,
  description: true,
  projectType: true,
  status: true,
  health: true,
  currentPhase: true,
  startDate: true,
  targetGoLiveDate: true,
  actualGoLiveDate: true,
  progressPercentage: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true, industry: true } },
  projectManager: { select: { id: true, name: true, email: true } },
  functionalLead: { select: { id: true, name: true, email: true } },
  technicalLead: { select: { id: true, name: true, email: true } },
  _count: {
    select: {
      tasks: true,
      milestones: true,
      raidItems: true,
      members: true,
    },
  },
} as const

export async function listProjects(
  organizationId: string,
  query: {
    page?: string
    perPage?: string
    status?: string
    health?: string
    type?: string
    search?: string
  }
) {
  const { page, perPage, skip } = parsePagination(query)
  const where = {
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.health && { health: query.health as any }),
    ...(query.type && { projectType: query.type as any }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' as const } },
        { projectCode: { contains: query.search, mode: 'insensitive' as const } },
        { customer: { name: { contains: query.search, mode: 'insensitive' as const } } },
      ],
    }),
  }

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      select: PROJECT_SELECT,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
    }),
  ])

  return { projects, meta: paginationMeta(total, page, perPage) }
}

export async function getProject(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: PROJECT_SELECT,
  })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function createProject(
  organizationId: string,
  actorId: string,
  input: CreateProjectInput
) {
  // Validate customer belongs to org
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, organizationId },
  })
  if (!customer) throw Errors.notFound('Customer')

  // Check unique project code
  const existing = await prisma.project.findFirst({
    where: { organizationId, projectCode: input.projectCode },
  })
  if (existing) throw Errors.conflict(`Project code "${input.projectCode}" is already in use`)

  const project = await prisma.project.create({
    data: {
      ...input,
      organizationId,
      createdBy: actorId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      targetGoLiveDate: input.targetGoLiveDate ? new Date(input.targetGoLiveDate) : undefined,
    },
    select: PROJECT_SELECT,
  })

  await writeAuditLog({
    organizationId,
    projectId: project.id,
    actorUserId: actorId,
    entityType: 'Project',
    entityId: project.id,
    action: 'CREATE',
    afterData: { name: project.name, code: project.projectCode },
  })

  return project
}

export async function updateProject(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: UpdateProjectInput
) {
  const existing = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!existing) throw Errors.notFound('Project')

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...input,
      updatedBy: actorId,
      startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : undefined,
      targetGoLiveDate: input.targetGoLiveDate !== undefined ? (input.targetGoLiveDate ? new Date(input.targetGoLiveDate) : null) : undefined,
      actualGoLiveDate: input.actualGoLiveDate !== undefined ? (input.actualGoLiveDate ? new Date(input.actualGoLiveDate) : null) : undefined,
    },
    select: PROJECT_SELECT,
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'Project',
    entityId: projectId,
    action: 'UPDATE',
    beforeData: { status: existing.status, health: existing.health },
    afterData: { status: project.status, health: project.health },
  })

  return project
}

export async function deleteProject(organizationId: string, projectId: string, actorId: string) {
  const existing = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!existing) throw Errors.notFound('Project')

  await prisma.project.delete({ where: { id: projectId } })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'Project',
    entityId: projectId,
    action: 'DELETE',
    beforeData: { name: existing.name, code: existing.projectCode },
  })
}

export async function getProjectMembers(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')

  return prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  })
}
