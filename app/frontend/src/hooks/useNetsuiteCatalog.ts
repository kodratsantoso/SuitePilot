import { useQuery } from '@tanstack/react-query'
import { netsuiteCatalogApi } from '@/lib/api'
import type { NetsuiteModule } from '@/types'

export function useNetsuiteCatalog() {
  return useQuery({
    queryKey: ['netsuite-catalog'],
    queryFn: async (): Promise<NetsuiteModule[]> => {
      const res = await netsuiteCatalogApi.list()
      return (res.data ?? []) as NetsuiteModule[]
    },
  })
}
