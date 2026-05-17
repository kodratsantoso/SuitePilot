import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiRegistryApi, documentsApi, evaluationsApi, knowledgeApi } from '@/lib/api'
import type { AiEvaluationRun, AiRegistry, EvaluationCase, KnowledgeRetrievalResult, KnowledgeSource, ProjectDocument } from '@/types'

export function useProjectDocuments(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['project-documents', projectId, params],
    queryFn: async (): Promise<ProjectDocument[]> => (await documentsApi.list(projectId, params)).data ?? [],
    enabled: !!projectId,
  })
}

export function useCreateProjectDocument(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => documentsApi.create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-documents', projectId] }),
  })
}

export function useKnowledgeSources(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['knowledge-sources', projectId, params],
    queryFn: async (): Promise<KnowledgeSource[]> => (await knowledgeApi.listSources(projectId, params)).data ?? [],
    enabled: !!projectId,
  })
}

export function useCreateKnowledgeSource(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => knowledgeApi.createSource(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge-sources', projectId] }),
  })
}

export function useRetrieveKnowledge(projectId: string) {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>): Promise<KnowledgeRetrievalResult[]> =>
      (await knowledgeApi.retrieve(projectId, data)).data ?? [],
  })
}

export function useEvaluationCases(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['evaluation-cases', projectId, params],
    queryFn: async (): Promise<EvaluationCase[]> => (await evaluationsApi.listCases(projectId, params)).data ?? [],
    enabled: !!projectId,
  })
}

export function useEvaluationRuns(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['evaluation-runs', projectId, params],
    queryFn: async (): Promise<AiEvaluationRun[]> => (await evaluationsApi.listRuns(projectId, params)).data ?? [],
    enabled: !!projectId,
  })
}

export function useCreateEvaluationCase(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => evaluationsApi.createCase(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluation-cases', projectId] }),
  })
}

export function useRunEvaluation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => evaluationsApi.run(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluation-runs', projectId] }),
  })
}

export function useAiRegistry() {
  return useQuery({
    queryKey: ['ai-registry'],
    queryFn: async (): Promise<AiRegistry> => (await aiRegistryApi.get()).data,
  })
}
