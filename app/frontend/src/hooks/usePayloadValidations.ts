import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payloadValidationsApi } from '@/lib/api'
import type { PayloadValidation } from '@/types'

export function usePayloadValidations(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['payload-validations', projectId, params],
    queryFn: async (): Promise<PayloadValidation[]> => {
      const res = await payloadValidationsApi.list(projectId, params)
      return (res.data ?? []) as PayloadValidation[]
    },
    enabled: !!projectId,
  })
}

export function useCreatePayloadValidation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => payloadValidationsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payload-validations', projectId] })
    },
  })
}

export function useUpdatePayloadValidation(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ validationId, data }: { validationId: string; data: Record<string, unknown> }) =>
      payloadValidationsApi.update(projectId, validationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payload-validations', projectId] })
    },
  })
}
