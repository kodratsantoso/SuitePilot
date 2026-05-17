import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scopeEstimationApi } from '@/lib/api'
import type { ScopeEstimation } from '@/types'

export function useScopeEstimations(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['scope-estimations', projectId, params],
    queryFn: async (): Promise<ScopeEstimation[]> => {
      const res = await scopeEstimationApi.list(projectId, params)
      return (res.data ?? []) as ScopeEstimation[]
    },
    enabled: !!projectId,
  })
}

export function useRunScopeEstimation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => scopeEstimationApi.run(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scope-estimations', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
    },
  })
}
