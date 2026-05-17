import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { painPointAnalysisApi } from '@/lib/api'
import type { PainPointClassification } from '@/types'

export function usePainPointAnalysis(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['pain-point-analysis', projectId, params],
    queryFn: async (): Promise<PainPointClassification[]> => {
      const res = await painPointAnalysisApi.list(projectId, params)
      return (res.data ?? []) as PainPointClassification[]
    },
    enabled: !!projectId,
  })
}

export function useRunPainPointAnalysis(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => painPointAnalysisApi.run(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pain-point-analysis', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
    },
  })
}
