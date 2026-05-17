import { z } from 'zod'

export const runRequirementAnalysisSchema = z.object({
  discoverySessionId: z.string().uuid().optional(),
})

export const runPainPointClassificationSchema = z.object({
  discoverySessionId: z.string().uuid().optional(),
})

export const runModuleRecommendationSchema = z.object({
  discoverySessionId: z.string().uuid().optional(),
})

export const runScopeEstimationSchema = z.object({
  discoverySessionId: z.string().uuid().optional(),
})

export const runProposalDraftSchema = z.object({
  discoverySessionId: z.string().uuid().optional(),
})

export type RunRequirementAnalysisInput = z.infer<typeof runRequirementAnalysisSchema>
export type RunPainPointClassificationInput = z.infer<typeof runPainPointClassificationSchema>
export type RunModuleRecommendationInput = z.infer<typeof runModuleRecommendationSchema>
export type RunScopeEstimationInput = z.infer<typeof runScopeEstimationSchema>
export type RunProposalDraftInput = z.infer<typeof runProposalDraftSchema>
