import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { technicalDeliverablesApi } from '@/lib/api'
import type { TechnicalDeliverable } from '@/types'

export function useTechnicalDeliverables(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['technical-deliverables', projectId, params],
    queryFn: async (): Promise<TechnicalDeliverable[]> => {
      const res = await technicalDeliverablesApi.list(projectId, params)
      return (res.data ?? []) as TechnicalDeliverable[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTechnicalDeliverable(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => technicalDeliverablesApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['technical-deliverables', projectId] })
    },
  })
}
