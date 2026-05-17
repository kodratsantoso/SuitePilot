import { z } from 'zod'

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

export const createRaidSchema = z.object({
  type: z.enum(['RISK', 'ASSUMPTION', 'ISSUE', 'DEPENDENCY', 'DECISION']),
  title: z.string().min(1).max(300),
  description: z.string().min(1).max(2000),
  status: z.enum(['OPEN', 'MONITORING', 'MITIGATED', 'RESOLVED', 'CLOSED', 'ESCALATED']).optional(),
  severity: severityEnum.optional(),
  probability: severityEnum.optional(),
  impact: severityEnum.optional(),
  mitigation: z.string().max(2000).optional(),
  ownerId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional().nullable(),
})

export const updateRaidSchema = createRaidSchema.partial()

export type CreateRaidInput = z.infer<typeof createRaidSchema>
export type UpdateRaidInput = z.infer<typeof updateRaidSchema>
