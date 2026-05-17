import { z } from 'zod'

export const createRequirementSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(3000).optional(),
  category: z
    .enum([
      'COMPANY_PROFILE',
      'FINANCE',
      'PROCUREMENT',
      'INVENTORY',
      'SALES',
      'CRM',
      'MANUFACTURING',
      'REPORTING',
      'INTEGRATION',
      'COMPLIANCE',
      'PAIN_POINT',
      'GOVERNANCE',
      'TECHNICAL',
      'OTHER',
    ])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  source: z.enum(['MANUAL', 'AI_EXTRACTED', 'MEETING', 'DOCUMENT', 'INTERVIEW']).optional(),
  discoverySessionId: z.string().uuid().optional(),
})

export const updateRequirementSchema = createRequirementSchema.partial()

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>
export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>
