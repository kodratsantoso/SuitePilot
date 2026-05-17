import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  BACKLOG: { label: 'Backlog', className: 'bg-gray-100 text-gray-600' },
  TODO: { label: 'To Do', className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700' },
  BLOCKED: { label: 'Blocked', className: 'bg-red-100 text-red-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-400' },
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  )
}
