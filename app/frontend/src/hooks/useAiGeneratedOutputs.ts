import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiGeneratedOutputsApi } from '@/lib/api'
import type { AiGeneratedOutput } from '@/types'

export function useAiGeneratedOutputs(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['ai-generated-outputs', projectId, params],
    queryFn: async (): Promise<AiGeneratedOutput[]> => {
      const res = await aiGeneratedOutputsApi.list(projectId, params)
      return (res.data ?? []) as AiGeneratedOutput[]
    },
    enabled: !!projectId,
  })
}

export function useAiGeneratedOutput(projectId: string, outputId: string) {
  return useQuery({
    queryKey: ['ai-generated-output', projectId, outputId],
    queryFn: async (): Promise<AiGeneratedOutput> => {
      const res = await aiGeneratedOutputsApi.get(projectId, outputId)
      return res.data as AiGeneratedOutput
    },
    enabled: !!projectId && !!outputId,
  })
}

export function useCreateAiGeneratedOutput(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => aiGeneratedOutputsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
    },
  })
}

export function useUpdateAiGeneratedOutput(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ outputId, data }: { outputId: string; data: Record<string, unknown> }) =>
      aiGeneratedOutputsApi.update(projectId, outputId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-output', projectId, vars.outputId] })
    },
  })
}

export function useReviewAiGeneratedOutput(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ outputId, data }: { outputId: string; data: Record<string, unknown> }) =>
      aiGeneratedOutputsApi.review(projectId, outputId, data),
    onSuccess: (_data, vars: { outputId: string; data: Record<string, unknown> }) => {
      qc.invalidateQueries({ queryKey: ['ai-generated-outputs', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-generated-output', projectId, vars.outputId] })
    },
  })
}
