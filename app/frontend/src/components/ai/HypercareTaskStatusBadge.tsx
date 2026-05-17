import { cn } from '@/lib/utils'
import type { HypercareTaskStatus } from '@/types'

const config: Record<HypercareTaskStatus, { label: string; className: string; dot: string }> = {
  BACKLOG:     { label: 'Backlog',     className: 'text-gray-600',   dot: 'bg-gray-400' },
  IN_PROGRESS: { label: 'In Progress', className: 'text-blue-600',   dot: 'bg-blue-400' },
  BLOCKED:     { label: 'Blocked',     className: 'text-red-600',    dot: 'bg-red-500' },
  DONE:        { label: 'Done',        className: 'text-green-600',  dot: 'bg-green-500' },
  ESCALATED:   { label: 'Escalated',   className: 'text-orange-600', dot: 'bg-orange-400' },
}

export function HypercareTaskStatusBadge({
  status,
  className,
}: {
  status: HypercareTaskStatus
  className?: string
}) {
  const cfg = config[status] ?? config.BACKLOG
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
