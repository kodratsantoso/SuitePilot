import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { functionalDeliverablesApi } from '@/lib/api'
import type { FunctionalDeliverable } from '@/types'

export function useFunctionalDeliverables(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['functionalDeliverables', projectId, params],
    queryFn: async (): Promise<FunctionalDeliverable[]> => {
      const res = await functionalDeliverablesApi.list(projectId, params)
      return (res.data ?? []) as FunctionalDeliverable[]
    },
    enabled: !!projectId,
  })
}

export function useCreateFunctionalDeliverable(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => functionalDeliverablesApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['functionalDeliverables', projectId] })
    },
  })
}
