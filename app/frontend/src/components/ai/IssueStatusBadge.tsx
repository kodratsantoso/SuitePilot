import { cn } from '@/lib/utils'
import type { IssueStatus } from '@/types'

const config: Record<IssueStatus, { label: string; className: string; dot: string }> = {
  OPEN:        { label: 'Open',        className: 'text-red-600',    dot: 'bg-red-500' },
  IN_PROGRESS: { label: 'In Progress', className: 'text-yellow-600', dot: 'bg-yellow-400' },
  ESCALATED:   { label: 'Escalated',   className: 'text-orange-600', dot: 'bg-orange-400' },
  RESOLVED:    { label: 'Resolved',    className: 'text-green-600',  dot: 'bg-green-500' },
  CLOSED:      { label: 'Closed',      className: 'text-gray-500',   dot: 'bg-gray-400' },
}

export function IssueStatusBadge({
  status,
  className,
}: {
  status: IssueStatus
  className?: string
}) {
  const cfg = config[status] ?? config.OPEN
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
