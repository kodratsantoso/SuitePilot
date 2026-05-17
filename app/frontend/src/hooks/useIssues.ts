'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { issuesApi } from '@/lib/api'
import type { Issue } from '@/types'

export function useIssues(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['issues', projectId, params],
    queryFn: async (): Promise<Issue[]> => {
      const res = await issuesApi.list(projectId, params)
      return (res.data ?? []) as Issue[]
    },
    enabled: !!projectId,
  })
}

export function useCreateIssue(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => issuesApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] })
    },
  })
}

export function useUpdateIssue(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: Record<string, unknown> }) =>
      issuesApi.update(projectId, issueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] })
    },
  })
}

export function useDeleteIssue(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (issueId: string) => issuesApi.delete(projectId, issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] })
    },
  })
}
