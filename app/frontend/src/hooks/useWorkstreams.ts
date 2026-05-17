import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workstreamsApi } from '@/lib/api'
import type { FunctionalWorkstream } from '@/types'

export function useWorkstreams(projectId: string) {
  return useQuery({
    queryKey: ['workstreams', projectId],
    queryFn: async (): Promise<FunctionalWorkstream[]> => {
      const res = await workstreamsApi.list(projectId)
      return (res.data ?? []) as FunctionalWorkstream[]
    },
    enabled: !!projectId,
  })
}

export function useCreateWorkstream(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => workstreamsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workstreams', projectId] })
    },
  })
}

export function useUpdateWorkstream(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workstreamId, data }: { workstreamId: string; data: Record<string, unknown> }) =>
      workstreamsApi.update(projectId, workstreamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workstreams', projectId] })
    },
  })
}
