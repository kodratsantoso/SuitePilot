import type { CreateMessageInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { parsePagination, paginationMeta } from '../../types/index.js'

async function validateConversationAccess(organizationId: string, conversationId: string) {
  const conv = await prisma.aiConversation.findFirst({
    where: { id: conversationId, organizationId },
  })
  if (!conv) throw Errors.notFound('AiConversation')
  return conv
}

export async function listMessages(
  organizationId: string,
  conversationId: string,
  query: { page?: string; perPage?: string }
) {
  await validateConversationAccess(organizationId, conversationId)
  const { page, perPage, skip } = parsePagination(query)

  const where = { conversationId }

  const [total, messages] = await prisma.$transaction([
    prisma.aiMessage.count({ where }),
    prisma.aiMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip,
      take: perPage,
    }),
  ])

  return { messages, meta: paginationMeta(total, page, perPage) }
}

export async function createMessage(
  organizationId: string,
  conversationId: string,
  input: CreateMessageInput
) {
  await validateConversationAccess(organizationId, conversationId)

  const message = await prisma.aiMessage.create({
    data: {
      ...input,
      conversationId,
    },
  })

  await prisma.aiConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return message
}
