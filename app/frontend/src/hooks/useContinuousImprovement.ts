'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { continuousImprovementApi } from '@/lib/api'
import type {
  FeedbackEntry,
  OptimizationRecommendation,
  OptimizationScore,
  ContinuousImprovementSummary,
} from '@/types'

export function useCISummary(projectId: string) {
  return useQuery({
    queryKey: ['ci-summary', projectId],
    queryFn: () => continuousImprovementApi.getSummary(projectId).then(r => r.data as ContinuousImprovementSummary),
    enabled: !!projectId,
  })
}

export function useFeedbackEntries(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['ci-feedback', projectId, params],
    queryFn: async (): Promise<FeedbackEntry[]> => {
      const res = await continuousImprovementApi.listFeedback(projectId, params)
      return (res.data ?? []) as FeedbackEntry[]
    },
    enabled: !!projectId,
  })
}

export function useCreateFeedback(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      continuousImprovementApi.createFeedback(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ci-feedback', projectId] })
      qc.invalidateQueries({ queryKey: ['ci-summary', projectId] })
    },
  })
}

export function useRecommendations(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['ci-recommendations', projectId, params],
    queryFn: async (): Promise<OptimizationRecommendation[]> => {
      const res = await continuousImprovementApi.listRecommendations(projectId, params)
      return (res.data ?? []) as OptimizationRecommendation[]
    },
    enabled: !!projectId,
  })
}

export function useCreateRecommendation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      continuousImprovementApi.createRecommendation(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ci-recommendations', projectId] })
      qc.invalidateQueries({ queryKey: ['ci-summary', projectId] })
    },
  })
}

export function useUpdateRecommendation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      continuousImprovementApi.updateRecommendation(projectId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ci-recommendations', projectId] })
      qc.invalidateQueries({ queryKey: ['ci-summary', projectId] })
    },
  })
}

export function useOptimizationScores(projectId: string) {
  return useQuery({
    queryKey: ['ci-scores', projectId],
    queryFn: async (): Promise<OptimizationScore[]> => {
      const res = await continuousImprovementApi.getScores(projectId)
      return (res.data ?? []) as OptimizationScore[]
    },
    enabled: !!projectId,
  })
}

export function useOptimizationTrends(
  projectId: string,
  params?: { metricType?: string; timeRange?: number }
) {
  return useQuery({
    queryKey: ['ci-trends', projectId, params],
    queryFn: async (): Promise<OptimizationScore[]> => {
      const res = await continuousImprovementApi.getTrends(projectId, params)
      return (res.data ?? []) as OptimizationScore[]
    },
    enabled: !!projectId,
  })
}
