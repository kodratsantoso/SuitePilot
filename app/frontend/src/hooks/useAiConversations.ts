import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiConversationsApi, aiMessagesApi } from '@/lib/api'
import type { AiConversation, AiMessage } from '@/types'

export function useAiConversations(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['ai-conversations', projectId, params],
    queryFn: async (): Promise<AiConversation[]> => {
      const res = await aiConversationsApi.list(projectId, params)
      return (res.data ?? []) as AiConversation[]
    },
    enabled: !!projectId,
  })
}

export function useAiConversation(projectId: string, conversationId: string) {
  return useQuery({
    queryKey: ['ai-conversation', projectId, conversationId],
    queryFn: async (): Promise<AiConversation> => {
      const res = await aiConversationsApi.get(projectId, conversationId)
      return res.data as AiConversation
    },
    enabled: !!projectId && !!conversationId,
  })
}

export function useCreateAiConversation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => aiConversationsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-conversations', projectId] })
    },
  })
}

export function useUpdateAiConversation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: Record<string, unknown> }) =>
      aiConversationsApi.update(projectId, conversationId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['ai-conversations', projectId] })
      qc.invalidateQueries({ queryKey: ['ai-conversation', projectId, vars.conversationId] })
    },
  })
}

export function useAiMessages(conversationId: string) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: async (): Promise<AiMessage[]> => {
      const res = await aiMessagesApi.list(conversationId)
      return (res.data ?? []) as AiMessage[]
    },
    enabled: !!conversationId,
  })
}

export function useCreateAiMessage(conversationId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => aiMessagesApi.create(conversationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-messages', conversationId] })
      qc.invalidateQueries({ queryKey: ['ai-conversation', projectId, conversationId] })
    },
  })
}
