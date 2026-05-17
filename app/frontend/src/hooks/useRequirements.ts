import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requirementsApi } from '@/lib/api'
import type { Requirement } from '@/types'

export function useRequirements(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['requirements', projectId, params],
    queryFn: async (): Promise<Requirement[]> => {
      const res = await requirementsApi.list(projectId, params)
      return (res.data ?? []) as Requirement[]
    },
    enabled: !!projectId,
  })
}

export function useCreateRequirement(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => requirementsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requirements', projectId] })
    },
  })
}
