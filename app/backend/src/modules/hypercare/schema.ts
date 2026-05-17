import { z } from 'zod'

export const createHypercareTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  ownerId: z.string().uuid().optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'ESCALATED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
})
export const updateHypercareTaskSchema = createHypercareTaskSchema.partial().extend({
  completedAt: z.string().datetime().optional().nullable(),
})

export const createIssueSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(3000).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.string().uuid().optional(),
  hypercareTaskId: z.string().uuid().optional(),
})
export const updateIssueSchema = createIssueSchema.partial().extend({
  resolvedAt: z.string().datetime().optional().nullable(),
})

export const updateGoLiveItemSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'BLOCKED', 'NOT_APPLICABLE']),
  notes: z.string().max(1000).optional(),
})
export const bulkCreateGoLiveSchema = z.object({
  items: z.array(z.object({ checklistItem: z.string().min(1).max(500) })).min(1).max(100),
})

export const createChangeRequestSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(3000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['PROPOSED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED']).optional(),
})
export const updateChangeRequestSchema = createChangeRequestSchema.partial().extend({
  resolvedAt: z.string().datetime().optional().nullable(),
})

export const createRiskSchema = z.object({
  description: z.string().min(1).max(2000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'MONITORING', 'MITIGATED', 'CLOSED']).optional(),
  mitigation: z.string().max(2000).optional(),
})
export const updateRiskSchema = createRiskSchema.partial()

export type CreateHypercareTaskInput = z.infer<typeof createHypercareTaskSchema>
export type UpdateHypercareTaskInput = z.infer<typeof updateHypercareTaskSchema>
export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>
export type UpdateGoLiveItemInput = z.infer<typeof updateGoLiveItemSchema>
export type BulkCreateGoLiveInput = z.infer<typeof bulkCreateGoLiveSchema>
export type CreateChangeRequestInput = z.infer<typeof createChangeRequestSchema>
export type UpdateChangeRequestInput = z.infer<typeof updateChangeRequestSchema>
export type CreateRiskInput = z.infer<typeof createRiskSchema>
export type UpdateRiskInput = z.infer<typeof updateRiskSchema>
