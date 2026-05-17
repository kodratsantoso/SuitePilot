'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { governanceApi } from '@/lib/api'

export function useGovernanceEvents(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['governance-events', projectId, params],
    queryFn: () => governanceApi.listEvents(projectId, params).then(r => r.data),
    enabled: !!projectId,
  })
}

export function useCreateGovernanceEvent(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => governanceApi.createEvent(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['governance-events', projectId] })
      qc.invalidateQueries({ queryKey: ['rag-status', projectId] })
    },
  })
}

export function useOutputValidations(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['output-validations', projectId, params],
    queryFn: () => governanceApi.listValidations(projectId, params).then(r => r.data),
    enabled: !!projectId,
  })
}

export function useCreateOutputValidation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => governanceApi.createValidation(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['output-validations', projectId] })
      qc.invalidateQueries({ queryKey: ['rag-status', projectId] })
    },
  })
}

export function useReviewGates(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['review-gates', projectId, params],
    queryFn: () => governanceApi.listReviewGates(projectId, params).then(r => r.data),
    enabled: !!projectId,
  })
}

export function useCreateReviewGate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => governanceApi.createReviewGate(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-gates', projectId] })
      qc.invalidateQueries({ queryKey: ['rag-status', projectId] })
    },
  })
}

export function useUpdateReviewGate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ gateId, data }: { gateId: string; data: Record<string, unknown> }) =>
      governanceApi.updateReviewGate(projectId, gateId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-gates', projectId] })
      qc.invalidateQueries({ queryKey: ['rag-status', projectId] })
    },
  })
}

export function useRagStatus(projectId: string) {
  return useQuery({
    queryKey: ['rag-status', projectId],
    queryFn: () => governanceApi.getRagStatus(projectId).then(r => r.data),
    enabled: !!projectId,
  })
}
