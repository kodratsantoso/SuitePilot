import { z } from 'zod'

export const createMilestoneSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  targetDate: z.string().datetime(),
  status: z
    .enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'])
    .optional(),
  ownerId: z.string().uuid().optional(),
  completionPercentage: z.number().int().min(0).max(100).optional(),
})

export const updateMilestoneSchema = createMilestoneSchema.partial().extend({
  actualDate: z.string().datetime().optional().nullable(),
})

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
