import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { discoverySessionsApi, discoveryQuestionsApi, discoveryAnswersApi } from '@/lib/api'
import type { DiscoverySession, DiscoveryQuestion, DiscoveryAnswer } from '@/types'

export function useDiscoverySessions(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['discovery-sessions', projectId, params],
    queryFn: async (): Promise<DiscoverySession[]> => {
      const res = await discoverySessionsApi.list(projectId, params)
      return (res.data ?? []) as DiscoverySession[]
    },
    enabled: !!projectId,
  })
}

export function useDiscoverySession(projectId: string, sessionId: string) {
  return useQuery({
    queryKey: ['discovery-session', projectId, sessionId],
    queryFn: async (): Promise<DiscoverySession> => {
      const res = await discoverySessionsApi.get(projectId, sessionId)
      return res.data as DiscoverySession
    },
    enabled: !!projectId && !!sessionId,
  })
}

export function useCreateDiscoverySession(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => discoverySessionsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discovery-sessions', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useUpdateDiscoverySession(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: Record<string, unknown> }) =>
      discoverySessionsApi.update(projectId, sessionId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['discovery-sessions', projectId] })
      qc.invalidateQueries({ queryKey: ['discovery-session', projectId, vars.sessionId] })
    },
  })
}

export function useDeleteDiscoverySession(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => discoverySessionsApi.delete(projectId, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discovery-sessions', projectId] })
      qc.invalidateQueries({ queryKey: ['activity', projectId] })
    },
  })
}

export function useDiscoveryQuestions(sessionId: string) {
  return useQuery({
    queryKey: ['discovery-questions', sessionId],
    queryFn: async (): Promise<DiscoveryQuestion[]> => {
      const res = await discoveryQuestionsApi.list(sessionId)
      return (res.data ?? []) as DiscoveryQuestion[]
    },
    enabled: !!sessionId,
  })
}

export function useCreateDiscoveryQuestion(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => discoveryQuestionsApi.create(sessionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discovery-questions', sessionId] })
    },
  })
}

export function useDiscoveryAnswers(sessionId: string) {
  return useQuery({
    queryKey: ['discovery-answers', sessionId],
    queryFn: async (): Promise<DiscoveryAnswer[]> => {
      const res = await discoveryAnswersApi.list(sessionId)
      return (res.data ?? []) as DiscoveryAnswer[]
    },
    enabled: !!sessionId,
  })
}

export function useCreateDiscoveryAnswer(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => discoveryAnswersApi.createOrUpdate(sessionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discovery-answers', sessionId] })
    },
  })
}
