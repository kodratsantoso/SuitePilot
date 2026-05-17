'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deploymentApi } from '@/lib/api'

export function useDeploymentOverview() {
  return useQuery({ queryKey: ['deployment-overview'], queryFn: () => deploymentApi.getOverview().then(r => r.data) })
}

export function useDeploymentRuns(params?: Record<string, string>) {
  return useQuery({ queryKey: ['deployment-runs', params], queryFn: () => deploymentApi.listRuns(params).then(r => r.data) })
}

export function useDeploymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deployment-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['deployment-runs'] })
    },
  })
}
