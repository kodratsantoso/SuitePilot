import { z } from 'zod'

export const createMessageSchema = z.object({
  role: z.enum(['SYSTEM', 'USER', 'ASSISTANT']),
  content: z.string().min(1).max(50000),
  tokenUsage: z.number().int().min(0).optional(),
  model: z.string().max(100).optional(),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>
