import { z } from 'zod'

export const createFeedbackSchema = z.object({
  feedbackType: z.enum(['HUMAN_REVIEW','GOVERNANCE_FLAG','HYPERCARE_OUTCOME','TASK_OUTCOME','RISK_OBSERVED','AI_OUTPUT_PERFORMANCE']),
  description: z.string().min(1).max(5000),
  severity: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  workstreamId: z.string().uuid().optional(),
  aiGeneratedOutputId: z.string().uuid().optional(),
})

export const createRecommendationSchema = z.object({
  recommendationType: z.enum(['PROCESS','AI_MODEL','WORKFLOW','RISK_MITIGATION']),
  description: z.string().min(1).max(5000),
  confidenceScore: z.number().min(0).max(100).optional(),
  impactScore: z.number().min(0).max(100).optional(),
  workstreamId: z.string().uuid().optional(),
})

export const updateRecommendationSchema = z.object({
  status: z.enum(['DRAFT','REVIEWED','APPROVED','IMPLEMENTED','REJECTED']),
  description: z.string().min(1).max(5000).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  impactScore: z.number().min(0).max(100).optional(),
})

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
export type CreateRecommendationInput = z.infer<typeof createRecommendationSchema>
export type UpdateRecommendationInput = z.infer<typeof updateRecommendationSchema>
