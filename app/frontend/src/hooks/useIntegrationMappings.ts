import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationMappingsApi } from '@/lib/api'
import type { IntegrationMapping } from '@/types'

export function useIntegrationMappings(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['integration-mappings', projectId, params],
    queryFn: async (): Promise<IntegrationMapping[]> => {
      const res = await integrationMappingsApi.list(projectId, params)
      return (res.data ?? []) as IntegrationMapping[]
    },
    enabled: !!projectId,
  })
}

export function useCreateIntegrationMapping(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => integrationMappingsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-mappings', projectId] })
    },
  })
}

export function useUpdateIntegrationMapping(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ mappingId, data }: { mappingId: string; data: Record<string, unknown> }) =>
      integrationMappingsApi.update(projectId, mappingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-mappings', projectId] })
    },
  })
}
