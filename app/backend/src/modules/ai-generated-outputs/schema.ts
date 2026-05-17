import { z } from 'zod'

const OUTPUT_TYPES = [
  'DISCOVERY_SUMMARY',
  'REQUIREMENT_ANALYSIS',
  'PAIN_POINT_ANALYSIS',
  'MODULE_RECOMMENDATION',
  'SCOPE_DRAFT',
  'PROPOSAL_DRAFT',
  'BRD_DRAFT',
  'FIT_GAP_DRAFT',
  'RISK_SUMMARY',
  'MEETING_SUMMARY',
] as const

const OUTPUT_STATUSES = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'REVISED',
  'PUBLISHED',
] as const

export const createOutputSchema = z.object({
  outputType: z.enum(OUTPUT_TYPES),
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  discoverySessionId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  generatedByAgent: z.string().max(100).optional(),
  generatedBySkill: z.string().max(100).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
})

export const updateOutputSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(OUTPUT_STATUSES).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
})

export type CreateOutputInput = z.infer<typeof createOutputSchema>
export type UpdateOutputInput = z.infer<typeof updateOutputSchema>
