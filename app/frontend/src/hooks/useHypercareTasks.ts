'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hypercareTasksApi } from '@/lib/api'
import type { HypercareTask } from '@/types'

export function useHypercareTasks(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['hypercare-tasks', projectId, params],
    queryFn: async (): Promise<HypercareTask[]> => {
      const res = await hypercareTasksApi.list(projectId, params)
      return (res.data ?? []) as HypercareTask[]
    },
    enabled: !!projectId,
  })
}

export function useCreateHypercareTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => hypercareTasksApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hypercare-tasks', projectId] })
    },
  })
}

export function useUpdateHypercareTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Record<string, unknown> }) =>
      hypercareTasksApi.update(projectId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hypercare-tasks', projectId] })
    },
  })
}

export function useDeleteHypercareTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => hypercareTasksApi.delete(projectId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hypercare-tasks', projectId] })
    },
  })
}
