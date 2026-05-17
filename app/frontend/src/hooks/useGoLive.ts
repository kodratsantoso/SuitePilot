'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goLiveApi } from '@/lib/api'
import type { GoLiveReadiness } from '@/types'

export function useGoLiveItems(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['go-live', projectId, params],
    queryFn: async (): Promise<GoLiveReadiness[]> => {
      const res = await goLiveApi.list(projectId, params)
      return (res.data ?? []) as GoLiveReadiness[]
    },
    enabled: !!projectId,
  })
}

export function useBulkCreateGoLiveItems(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { checklistItem: string }[]) => goLiveApi.bulkCreate(projectId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['go-live', projectId] })
    },
  })
}

export function useUpdateGoLiveItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Record<string, unknown> }) =>
      goLiveApi.update(projectId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['go-live', projectId] })
    },
  })
}
