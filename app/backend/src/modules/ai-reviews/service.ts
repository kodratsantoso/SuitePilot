import type { CreateReviewInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'

async function validateOutputAccess(organizationId: string, projectId: string, outputId: string) {
  const output = await prisma.aiGeneratedOutput.findFirst({
    where: { id: outputId, projectId, organizationId },
  })
  if (!output) throw Errors.notFound('AiGeneratedOutput')
  return output
}

export async function createReview(
  organizationId: string,
  projectId: string,
  outputId: string,
  reviewerId: string,
  input: CreateReviewInput
) {
  await validateOutputAccess(organizationId, projectId, outputId)

  const outputStatusMap: Record<string, string> = {
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    REVISION_REQUESTED: 'REVISED',
  }

  const newOutputStatus = outputStatusMap[input.status]

  const [review] = await prisma.$transaction([
    prisma.aiReview.create({
      data: {
        aiGeneratedOutputId: outputId,
        reviewerId,
        status: input.status,
        comments: input.comments,
        reviewedAt: new Date(),
      },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    }),
    prisma.aiGeneratedOutput.update({
      where: { id: outputId },
      data: { status: newOutputStatus as any },
    }),
  ])

  let action: string = 'UPDATE'
  if (input.status === 'APPROVED') action = 'APPROVE'
  else if (input.status === 'REJECTED') action = 'REJECT'

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: reviewerId,
    entityType: 'AiReview',
    entityId: review.id,
    action: action as any,
    afterData: { outputId, status: input.status, comments: input.comments },
  })

  return review
}
