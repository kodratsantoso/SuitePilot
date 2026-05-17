import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessProcessesApi } from '@/lib/api'
import type { BusinessProcess } from '@/types'

export function useBusinessProcesses(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['businessProcesses', projectId, params],
    queryFn: async (): Promise<BusinessProcess[]> => {
      const res = await businessProcessesApi.list(projectId, params)
      return (res.data ?? []) as BusinessProcess[]
    },
    enabled: !!projectId,
  })
}

export function useBusinessProcess(projectId: string, processId: string) {
  return useQuery({
    queryKey: ['businessProcess', projectId, processId],
    queryFn: async (): Promise<BusinessProcess> => {
      const res = await businessProcessesApi.get(projectId, processId)
      return res.data as BusinessProcess
    },
    enabled: !!projectId && !!processId,
  })
}

export function useCreateBusinessProcess(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => businessProcessesApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['businessProcesses', projectId] })
    },
  })
}

export function useUpdateBusinessProcess(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ processId, data }: { processId: string; data: Record<string, unknown> }) =>
      businessProcessesApi.update(projectId, processId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['businessProcesses', projectId] })
      qc.invalidateQueries({ queryKey: ['businessProcess', projectId] })
    },
  })
}

export function useAddProcessStep(projectId: string, processId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => businessProcessesApi.addStep(projectId, processId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['businessProcess', projectId, processId] })
      qc.invalidateQueries({ queryKey: ['businessProcesses', projectId] })
    },
  })
}
