import { z } from 'zod'

export const createGovernanceEventSchema = z.object({
  aiGeneratedOutputId: z.string().uuid(),
  agentName: z.string().max(100).optional(),
  skillName: z.string().max(100).optional(),
  eventType: z.enum(['HALLUCINATION_DETECTED', 'VALIDATION_PASSED', 'VALIDATION_FAILED', 'REVIEW_SUBMITTED', 'QUALITY_SCORE_ASSIGNED']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  ragStatus: z.enum(['GREEN', 'AMBER', 'RED']).optional(),
  reviewerId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
})

export const createValidationSchema = z.object({
  aiGeneratedOutputId: z.string().uuid(),
  validationType: z.enum(['SCHEMA_CHECK', 'DATA_CONSISTENCY', 'BUSINESS_RULE_CHECK']),
  result: z.enum(['PASS', 'WARNING', 'FAIL']),
  notes: z.string().max(2000).optional(),
})

export const createReviewGateSchema = z.object({
  aiGeneratedOutputId: z.string().uuid(),
  stage: z.enum(['AI_SELF_VALIDATION', 'PEER_REVIEW', 'HUMAN_REVIEW', 'GOVERNANCE_APPROVAL']),
  status: z.enum(['PENDING', 'PASSED', 'REJECTED', 'REVISION_REQUESTED']).optional(),
  notes: z.string().max(2000).optional(),
})

export const updateReviewGateSchema = z.object({
  status: z.enum(['PENDING', 'PASSED', 'REJECTED', 'REVISION_REQUESTED']),
  notes: z.string().max(2000).optional(),
})

export type CreateGovernanceEventInput = z.infer<typeof createGovernanceEventSchema>
export type CreateValidationInput = z.infer<typeof createValidationSchema>
export type CreateReviewGateInput = z.infer<typeof createReviewGateSchema>
export type UpdateReviewGateInput = z.infer<typeof updateReviewGateSchema>
