import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/lib/api'
import type { SopDocument } from '@/types'

export function useSopDocuments(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['sopDocuments', projectId, params],
    queryFn: async (): Promise<SopDocument[]> => {
      const res = await sopApi.list(projectId, params)
      return (res.data ?? []) as SopDocument[]
    },
    enabled: !!projectId,
  })
}

export function useGenerateSop(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => sopApi.generate(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sopDocuments', projectId] })
    },
  })
}

export function useUpdateSopDocument(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sopId, data }: { sopId: string; data: Record<string, unknown> }) =>
      sopApi.update(projectId, sopId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sopDocuments', projectId] })
    },
  })
}
