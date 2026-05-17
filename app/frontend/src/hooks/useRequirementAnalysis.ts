import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requirementAnalysisApi } from '@/lib/api'
import type { RequirementAnalysis } from '@/types'

export function useRequirementAnalysis(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['requirement-analysis', projectId, params],
    queryFn: async (): Promise<RequirementAnalysis[]> => {
      const res = await requirementAnalysisApi.list(projectId, params)
      return (res.data ?? []) as RequirementAnalysis[]
    },
    enabled: !!projectId,
  })
}

export function useRunRequirementAnalysis(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => requirementAnalysisApi.run(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requirement-analysis', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
    },
  })
}
