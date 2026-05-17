'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { changeRequestsApi } from '@/lib/api'
import type { ChangeRequest } from '@/types'

export function useChangeRequests(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['change-requests', projectId, params],
    queryFn: async (): Promise<ChangeRequest[]> => {
      const res = await changeRequestsApi.list(projectId, params)
      return (res.data ?? []) as ChangeRequest[]
    },
    enabled: !!projectId,
  })
}

export function useCreateChangeRequest(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => changeRequestsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-requests', projectId] })
    },
  })
}

export function useUpdateChangeRequest(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ changeId, data }: { changeId: string; data: Record<string, unknown> }) =>
      changeRequestsApi.update(projectId, changeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-requests', projectId] })
    },
  })
}
