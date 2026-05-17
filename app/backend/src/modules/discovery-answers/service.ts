import type { CreateAnswerInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'

async function validateSessionAccess(organizationId: string, sessionId: string) {
  const session = await prisma.discoverySession.findFirst({
    where: { id: sessionId },
    include: { project: { select: { organizationId: true } } },
  })
  if (!session || session.project.organizationId !== organizationId)
    throw Errors.notFound('DiscoverySession')
  return session
}

export async function listAnswers(organizationId: string, sessionId: string) {
  await validateSessionAccess(organizationId, sessionId)
  return prisma.discoveryAnswer.findMany({
    where: { discoverySessionId: sessionId },
    include: {
      question: { select: { id: true, category: true, question: true } },
    },
  })
}

export async function createOrUpdateAnswer(
  organizationId: string,
  sessionId: string,
  actorId: string,
  input: CreateAnswerInput
) {
  await validateSessionAccess(organizationId, sessionId)

  const existing = await prisma.discoveryAnswer.findFirst({
    where: {
      discoverySessionId: sessionId,
      discoveryQuestionId: input.discoveryQuestionId,
    },
  })

  if (existing) {
    return prisma.discoveryAnswer.update({
      where: { id: existing.id },
      data: {
        answer: input.answer,
        answeredBy: actorId,
      },
      include: {
        question: { select: { id: true, category: true, question: true } },
      },
    })
  }

  return prisma.discoveryAnswer.create({
    data: {
      discoverySessionId: sessionId,
      discoveryQuestionId: input.discoveryQuestionId,
      answer: input.answer,
      answeredBy: actorId,
    },
    include: {
      question: { select: { id: true, category: true, question: true } },
    },
  })
}
