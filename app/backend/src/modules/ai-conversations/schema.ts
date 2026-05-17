import { z } from 'zod'

export const createConversationSchema = z.object({
  title: z.string().min(1).max(300),
  discoverySessionId: z.string().uuid().optional(),
  agentName: z.string().max(100).optional(),
  skillName: z.string().max(100).optional(),
})

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'LOCKED']).optional(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>
