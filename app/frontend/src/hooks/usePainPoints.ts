import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { painPointsApi } from '@/lib/api'
import type { PainPoint } from '@/types'

export function usePainPoints(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['pain-points', projectId, params],
    queryFn: async (): Promise<PainPoint[]> => {
      const res = await painPointsApi.list(projectId, params)
      return (res.data ?? []) as PainPoint[]
    },
    enabled: !!projectId,
  })
}

export function useCreatePainPoint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => painPointsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pain-points', projectId] })
    },
  })
}
