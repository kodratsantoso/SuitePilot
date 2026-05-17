import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uatApi } from '@/lib/api'
import type { UatScenario } from '@/types'

export function useUatScenarios(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['uatScenarios', projectId, params],
    queryFn: async (): Promise<UatScenario[]> => {
      const res = await uatApi.list(projectId, params)
      return (res.data ?? []) as UatScenario[]
    },
    enabled: !!projectId,
  })
}

export function useGenerateUat(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => uatApi.generate(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uatScenarios', projectId] })
    },
  })
}

export function useUpdateUatScenario(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ scenarioId, data }: { scenarioId: string; data: Record<string, unknown> }) =>
      uatApi.update(projectId, scenarioId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uatScenarios', projectId] })
    },
  })
}
