import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleRecommendationsApi } from '@/lib/api'
import type { ModuleRecommendationAnalysis } from '@/types'

export function useModuleRecommendations(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['module-recommendations', projectId, params],
    queryFn: async (): Promise<ModuleRecommendationAnalysis[]> => {
      const res = await moduleRecommendationsApi.list(projectId, params)
      return (res.data ?? []) as ModuleRecommendationAnalysis[]
    },
    enabled: !!projectId,
  })
}

export function useRunModuleRecommendations(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => moduleRecommendationsApi.run(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-recommendations', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
    },
  })
}
