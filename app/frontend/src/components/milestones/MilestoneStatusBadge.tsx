import { cn } from '@/lib/utils'
import type { MilestoneStatus } from '@/types'

const statusConfig: Record<MilestoneStatus, { label: string; className: string }> = {
  NOT_STARTED: { label: 'Not Started', className: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  DELAYED: { label: 'Delayed', className: 'bg-red-100 text-red-700' },
  AT_RISK: { label: 'At Risk', className: 'bg-orange-100 text-orange-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-400' },
}

export function MilestoneStatusBadge({ status, className }: { status: MilestoneStatus; className?: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}
