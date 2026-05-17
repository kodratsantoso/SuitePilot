import type { CreateConversationInput, UpdateConversationInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

export async function listConversations(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; discoverySessionId?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.discoverySessionId && { discoverySessionId: query.discoverySessionId }),
  }

  const [total, conversations] = await prisma.$transaction([
    prisma.aiConversation.count({ where }),
    prisma.aiConversation.findMany({
      where,
      include: {
        _count: { select: { messages: true, generatedOutputs: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { conversations, meta: paginationMeta(total, page, perPage) }
}

export async function getConversation(
  organizationId: string,
  projectId: string,
  conversationId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const conv = await prisma.aiConversation.findFirst({
    where: { id: conversationId, projectId, organizationId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      _count: { select: { generatedOutputs: true } },
    },
  })
  if (!conv) throw Errors.notFound('AiConversation')
  return conv
}

export async function createConversation(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateConversationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const conversation = await prisma.aiConversation.create({
    data: {
      ...input,
      projectId,
      organizationId,
      createdBy: actorId,
    },
    include: {
      _count: { select: { messages: true, generatedOutputs: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'AiConversation',
    entityId: conversation.id,
    action: 'CREATE',
    afterData: { title: conversation.title },
  })

  return conversation
}

export async function updateConversation(
  organizationId: string,
  projectId: string,
  conversationId: string,
  actorId: string,
  input: UpdateConversationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const existing = await prisma.aiConversation.findFirst({
    where: { id: conversationId, projectId, organizationId },
  })
  if (!existing) throw Errors.notFound('AiConversation')

  const conversation = await prisma.aiConversation.update({
    where: { id: conversationId },
    data: { ...input },
    include: {
      _count: { select: { messages: true, generatedOutputs: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'AiConversation',
    entityId: conversationId,
    action: 'UPDATE',
    beforeData: { status: existing.status, title: existing.title },
    afterData: { status: conversation.status, title: conversation.title },
  })

  return conversation
}
