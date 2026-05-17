import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restletDesignsApi } from '@/lib/api'
import type { RestletDesign } from '@/types'

export function useRestletDesigns(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['restlet-designs', projectId, params],
    queryFn: async (): Promise<RestletDesign[]> => {
      const res = await restletDesignsApi.list(projectId, params)
      return (res.data ?? []) as RestletDesign[]
    },
    enabled: !!projectId,
  })
}

export function useCreateRestletDesign(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => restletDesignsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restlet-designs', projectId] })
    },
  })
}

export function useUpdateRestletDesign(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ restletId, data }: { restletId: string; data: Record<string, unknown> }) =>
      restletDesignsApi.update(projectId, restletId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restlet-designs', projectId] })
    },
  })
}
