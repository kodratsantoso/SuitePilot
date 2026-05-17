import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiContractsApi } from '@/lib/api'
import type { ApiContract } from '@/types'

export function useApiContracts(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['api-contracts', projectId, params],
    queryFn: async (): Promise<ApiContract[]> => {
      const res = await apiContractsApi.list(projectId, params)
      return (res.data ?? []) as ApiContract[]
    },
    enabled: !!projectId,
  })
}

export function useCreateApiContract(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiContractsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-contracts', projectId] })
    },
  })
}

export function useUpdateApiContract(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: Record<string, unknown> }) =>
      apiContractsApi.update(projectId, contractId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-contracts', projectId] })
    },
  })
}
