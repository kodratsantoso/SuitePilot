import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { raidApi } from '@/lib/api'
import type { RaidItem } from '@/types'

export function useRaidItems(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['raid', projectId, params],
    queryFn: async (): Promise<RaidItem[]> => {
      const res = await raidApi.list(projectId, params)
      return (res.data ?? []) as RaidItem[]
    },
    enabled: !!projectId,
  })
}

export function useCreateRaidItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => raidApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raid', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useUpdateRaidItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ raidId, data }: { raidId: string; data: Record<string, unknown> }) =>
      raidApi.update(projectId, raidId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raid', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useDeleteRaidItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (raidId: string) => raidApi.delete(projectId, raidId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raid', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}
