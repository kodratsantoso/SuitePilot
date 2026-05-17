import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { milestonesApi } from '@/lib/api'
import type { ProjectMilestone } from '@/types'

export function useMilestones(projectId: string) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async (): Promise<ProjectMilestone[]> => {
      const res = await milestonesApi.list(projectId)
      return (res.data ?? []) as ProjectMilestone[]
    },
    enabled: !!projectId,
  })
}

export function useCreateMilestone(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => milestonesApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useUpdateMilestone(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ milestoneId, data }: { milestoneId: string; data: Record<string, unknown> }) =>
      milestonesApi.update(projectId, milestoneId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useDeleteMilestone(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: string) => milestonesApi.delete(projectId, milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}
