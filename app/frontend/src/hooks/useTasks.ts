import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'
import type { ProjectTask } from '@/types'

export function useTasks(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tasks', projectId, params],
    queryFn: async (): Promise<ProjectTask[]> => {
      const res = await tasksApi.list(projectId, params)
      return (res.data ?? []) as ProjectTask[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => tasksApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Record<string, unknown> }) =>
      tasksApi.update(projectId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(projectId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}
