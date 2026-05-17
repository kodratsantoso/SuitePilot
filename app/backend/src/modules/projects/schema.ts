import { z } from 'zod'

export const createProjectSchema = z.object({
  customerId: z.string().uuid(),
  projectCode: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  projectType: z
    .enum(['NEW_IMPLEMENTATION', 'OPTIMIZATION', 'INTEGRATION', 'SUPPORT', 'UPGRADE', 'ASSESSMENT'])
    .optional(),
  startDate: z.string().datetime().optional(),
  targetGoLiveDate: z.string().datetime().optional(),
  projectManagerId: z.string().uuid().optional(),
  functionalLeadId: z.string().uuid().optional(),
  technicalLeadId: z.string().uuid().optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  projectType: z
    .enum(['NEW_IMPLEMENTATION', 'OPTIMIZATION', 'INTEGRATION', 'SUPPORT', 'UPGRADE', 'ASSESSMENT'])
    .optional(),
  status: z
    .enum(['DRAFT', 'PLANNED', 'ACTIVE', 'ON_HOLD', 'AT_RISK', 'DELAYED', 'COMPLETED', 'CANCELLED'])
    .optional(),
  health: z.enum(['GREEN', 'AMBER', 'RED', 'UNKNOWN']).optional(),
  currentPhase: z
    .enum(['PRESALES', 'DISCOVERY', 'DESIGN', 'BUILD', 'UAT', 'CUTOVER', 'HYPERCARE', 'CLOSED'])
    .optional(),
  startDate: z.string().datetime().optional().nullable(),
  targetGoLiveDate: z.string().datetime().optional().nullable(),
  actualGoLiveDate: z.string().datetime().optional().nullable(),
  progressPercentage: z.number().int().min(0).max(100).optional(),
  projectManagerId: z.string().uuid().optional().nullable(),
  functionalLeadId: z.string().uuid().optional().nullable(),
  technicalLeadId: z.string().uuid().optional().nullable(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
