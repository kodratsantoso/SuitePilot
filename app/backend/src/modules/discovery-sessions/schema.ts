import { z } from 'zod'

export const createDiscoverySessionSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED']).optional(),
  startedAt: z.string().datetime().optional().nullable(),
})

export const updateDiscoverySessionSchema = createDiscoverySessionSchema.partial().extend({
  completedAt: z.string().datetime().optional().nullable(),
})

export type CreateDiscoverySessionInput = z.infer<typeof createDiscoverySessionSchema>
export type UpdateDiscoverySessionInput = z.infer<typeof updateDiscoverySessionSchema>
