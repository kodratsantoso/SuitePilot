'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { securityApi } from '@/lib/api'

export function useAccessLogs(params?: Record<string, string>) {
  return useQuery({ queryKey: ['security-access-logs', params], queryFn: () => securityApi.listAccessLogs(params).then(r => r.data) })
}

export function useSecrets(params?: Record<string, string>) {
  return useQuery({ queryKey: ['security-secrets', params], queryFn: () => securityApi.listSecrets(params).then(r => r.data) })
}

export function useEncryptedFields() {
  return useQuery({ queryKey: ['security-encrypted-fields'], queryFn: () => securityApi.listEncryptedFields().then(r => r.data) })
}

export function useComplianceReport() {
  return useQuery({ queryKey: ['security-compliance-report'], queryFn: () => securityApi.getComplianceReport().then(r => r.data) })
}

export function useSecurityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['security-access-logs'] })
      void queryClient.invalidateQueries({ queryKey: ['security-secrets'] })
      void queryClient.invalidateQueries({ queryKey: ['security-encrypted-fields'] })
      void queryClient.invalidateQueries({ queryKey: ['security-compliance-report'] })
    },
  })
}
