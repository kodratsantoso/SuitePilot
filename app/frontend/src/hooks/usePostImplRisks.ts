'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postImplRisksApi } from '@/lib/api'
import type { PostImplementationRisk } from '@/types'

export function usePostImplRisks(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['post-impl-risks', projectId, params],
    queryFn: async (): Promise<PostImplementationRisk[]> => {
      const res = await postImplRisksApi.list(projectId, params)
      return (res.data ?? []) as PostImplementationRisk[]
    },
    enabled: !!projectId,
  })
}

export function useCreatePostImplRisk(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => postImplRisksApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-impl-risks', projectId] })
    },
  })
}

export function useUpdatePostImplRisk(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ riskId, data }: { riskId: string; data: Record<string, unknown> }) =>
      postImplRisksApi.update(projectId, riskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-impl-risks', projectId] })
    },
  })
}
