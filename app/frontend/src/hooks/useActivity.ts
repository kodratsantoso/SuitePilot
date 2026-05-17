import { useQuery } from '@tanstack/react-query'
import { activityApi } from '@/lib/api'
import type { ActivityItem } from '@/types'

export function useActivity(projectId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['activity', projectId, params],
    queryFn: async (): Promise<ActivityItem[]> => {
      const res = await activityApi.list(projectId, params)
      return (res.data ?? []) as ActivityItem[]
    },
    enabled: !!projectId,
  })
}
