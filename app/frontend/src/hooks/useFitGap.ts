import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fitGapApi } from '@/lib/api'
import type { FitGapAnalysis } from '@/types'

export function useFitGapAnalysis(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['fitGap', projectId, params],
    queryFn: async (): Promise<FitGapAnalysis[]> => {
      const res = await fitGapApi.list(projectId, params)
      return (res.data ?? []) as FitGapAnalysis[]
    },
    enabled: !!projectId,
  })
}

export function useRunFitGap(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => fitGapApi.run(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fitGap', projectId] })
    },
  })
}
