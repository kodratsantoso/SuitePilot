import { z } from 'zod'

export const createReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED']),
  comments: z.string().max(3000).optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
