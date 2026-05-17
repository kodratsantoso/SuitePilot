'use client'

import { useParams } from 'next/navigation'
import { useActivity } from '@/hooks/useActivity'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

export default function ActivityPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: items = [], isLoading, isError, refetch } = useActivity(projectId)

  return (
    <div>
      <PageHeader
        title="Activity"
        description={isLoading ? '' : `${items.length} recent action${items.length !== 1 ? 's' : ''}`}
      />

      <div className="mt-6 max-w-2xl">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            title="No activity yet"
            description="Project activity will appear here as tasks, milestones, and RAID items are created and updated."
          />
        )}
        {!isLoading && !isError && items.length > 0 && (
          <ActivityTimeline items={items} />
        )}
      </div>
    </div>
  )
}
