import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { technicalWorkstreamsApi } from '@/lib/api'
import type { TechnicalWorkstream } from '@/types'

export function useTechnicalWorkstreams(projectId: string) {
  return useQuery({
    queryKey: ['technical-workstreams', projectId],
    queryFn: async (): Promise<TechnicalWorkstream[]> => {
      const res = await technicalWorkstreamsApi.list(projectId)
      return (res.data ?? []) as TechnicalWorkstream[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTechnicalWorkstream(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => technicalWorkstreamsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['technical-workstreams', projectId] })
    },
  })
}

export function useUpdateTechnicalWorkstream(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workstreamId, data }: { workstreamId: string; data: Record<string, unknown> }) =>
      technicalWorkstreamsApi.update(projectId, workstreamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['technical-workstreams', projectId] })
    },
  })
}
