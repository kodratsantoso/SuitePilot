import { z } from 'zod'

export const createPainPointSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(3000).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  impactedArea: z.string().max(200).optional(),
  discoverySessionId: z.string().uuid().optional(),
})

export const updatePainPointSchema = createPainPointSchema.partial()

export type CreatePainPointInput = z.infer<typeof createPainPointSchema>
export type UpdatePainPointInput = z.infer<typeof updatePainPointSchema>
