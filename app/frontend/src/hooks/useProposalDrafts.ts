import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proposalDraftsApi } from '@/lib/api'
import type { AiGeneratedOutput } from '@/types'

export function useProposalDrafts(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['proposal-drafts', projectId, params],
    queryFn: async (): Promise<AiGeneratedOutput[]> => {
      const res = await proposalDraftsApi.list(projectId, params)
      return (res.data ?? []) as AiGeneratedOutput[]
    },
    enabled: !!projectId,
  })
}

export function useGenerateProposalDraft(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => proposalDraftsApi.generate(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal-drafts', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
    },
  })
}
