import type { CreateQuestionInput, BulkCreateQuestionsInput } from './schema.js'
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

export async function listQuestions(organizationId: string, sessionId: string) {
  await validateSessionAccess(organizationId, sessionId)
  return prisma.discoveryQuestion.findMany({
    where: { discoverySessionId: sessionId },
    orderBy: { order: 'asc' },
  })
}

export async function createQuestion(
  organizationId: string,
  sessionId: string,
  input: CreateQuestionInput
) {
  await validateSessionAccess(organizationId, sessionId)
  return prisma.discoveryQuestion.create({
    data: {
      ...input,
      discoverySessionId: sessionId,
    },
  })
}

export async function bulkCreateQuestions(
  organizationId: string,
  sessionId: string,
  questions: BulkCreateQuestionsInput['questions']
) {
  await validateSessionAccess(organizationId, sessionId)
  await prisma.discoveryQuestion.createMany({
    data: questions.map((q) => ({
      ...q,
      discoverySessionId: sessionId,
    })),
  })
  return prisma.discoveryQuestion.findMany({
    where: { discoverySessionId: sessionId },
    orderBy: { order: 'asc' },
  })
}
