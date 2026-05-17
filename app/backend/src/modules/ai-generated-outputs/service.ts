import type { CreateOutputInput, UpdateOutputInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listOutputs(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; outputType?: string; status?: string; discoverySessionId?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.outputType && { outputType: query.outputType as any }),
    ...(query.status && { status: query.status as any }),
    ...(query.discoverySessionId && { discoverySessionId: query.discoverySessionId }),
  }

  const [total, outputs] = await prisma.$transaction([
    prisma.aiGeneratedOutput.count({ where }),
    prisma.aiGeneratedOutput.findMany({
      where,
      include: {
        _count: { select: { reviews: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { outputs, meta: paginationMeta(total, page, perPage) }
}

export async function getOutput(
  organizationId: string,
  projectId: string,
  outputId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const output = await prisma.aiGeneratedOutput.findFirst({
    where: { id: outputId, projectId, organizationId },
    include: {
      reviews: {
        include: { reviewer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!output) throw Errors.notFound('AiGeneratedOutput')
  return output
}

export async function createOutput(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateOutputInput
) {
  await validateProjectAccess(organizationId, projectId)

  const output = await prisma.aiGeneratedOutput.create({
    data: {
      ...input,
      projectId,
      organizationId,
      createdBy: actorId,
    },
    include: {
      _count: { select: { reviews: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'AiGeneratedOutput',
    entityId: output.id,
    action: 'CREATE',
    afterData: { title: output.title, outputType: output.outputType },
  })

  return output
}

export async function updateOutput(
  organizationId: string,
  projectId: string,
  outputId: string,
  actorId: string,
  input: UpdateOutputInput
) {
  await validateProjectAccess(organizationId, projectId)

  const existing = await prisma.aiGeneratedOutput.findFirst({
    where: { id: outputId, projectId, organizationId },
  })
  if (!existing) throw Errors.notFound('AiGeneratedOutput')

  const updates: any = { ...input }
  if (input.content) updates.version = { increment: 1 }

  const output = await prisma.aiGeneratedOutput.update({
    where: { id: outputId },
    data: updates,
    include: {
      _count: { select: { reviews: true } },
    },
  })

  let action: string = 'UPDATE'
  if (input.status === 'APPROVED') action = 'APPROVE'
  else if (input.status === 'REJECTED') action = 'REJECT'

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'AiGeneratedOutput',
    entityId: outputId,
    action: action as any,
    beforeData: { status: existing.status, title: existing.title },
    afterData: { status: output.status, title: output.title },
  })

  return output
}
