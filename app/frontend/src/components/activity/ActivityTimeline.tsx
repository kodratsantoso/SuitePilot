import type { ActivityItem } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  items: ActivityItem[]
  className?: string
}

const entityColors: Record<string, string> = {
  ProjectTask: 'bg-blue-100 text-blue-700',
  ProjectMilestone: 'bg-purple-100 text-purple-700',
  RaidItem: 'bg-orange-100 text-orange-700',
  Project: 'bg-green-100 text-green-700',
  Customer: 'bg-gray-100 text-gray-600',
  User: 'bg-indigo-100 text-indigo-700',
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  LOGIN: 'bg-gray-400',
  APPROVE: 'bg-green-500',
  REJECT: 'bg-red-500',
}

function groupByDate(items: ActivityItem[]): Array<{ date: string; items: ActivityItem[] }> {
  const groups: Record<string, ActivityItem[]> = {}
  for (const item of items) {
    const date = new Date(item.createdAt).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date]!.push(item)
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }))
}

function entityLabel(entityType: string): string {
  return entityType
    .replace('Project', '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  const groups = groupByDate(items)

  return (
    <div className={cn('space-y-8', className)}>
      {groups.map(({ date, items: groupItems }) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">{date}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="space-y-3">
            {groupItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                      actionColors[item.action] ?? 'bg-gray-400'
                    )}
                  />
                  <div className="mt-1 w-px flex-1 bg-gray-100" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-sm font-medium text-gray-900">
                      {item.actor?.name ?? 'System'}
                    </span>
                    <span className="text-sm text-gray-600">{item.description}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        entityColors[item.entityType] ?? 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {entityLabel(item.entityType)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
