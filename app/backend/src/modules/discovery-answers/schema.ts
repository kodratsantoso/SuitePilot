import { z } from 'zod'

export const createAnswerSchema = z.object({
  discoveryQuestionId: z.string().uuid(),
  answer: z.string().min(1).max(5000),
})

export const updateAnswerSchema = z.object({
  answer: z.string().min(1).max(5000),
})

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>
