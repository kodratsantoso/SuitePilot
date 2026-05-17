import { cn } from '@/lib/utils'
import type { GoLiveStatus } from '@/types'

const config: Record<GoLiveStatus, { label: string; className: string; dot: string; italic?: boolean }> = {
  PENDING:        { label: 'Pending',       className: 'text-gray-500',  dot: 'bg-gray-400' },
  COMPLETED:      { label: 'Completed',     className: 'text-green-600', dot: 'bg-green-500' },
  BLOCKED:        { label: 'Blocked',       className: 'text-red-600',   dot: 'bg-red-500' },
  NOT_APPLICABLE: { label: 'N/A',           className: 'text-gray-400',  dot: 'bg-gray-300', italic: true },
}

export function GoLiveStatusBadge({
  status,
  className,
}: {
  status: GoLiveStatus
  className?: string
}) {
  const cfg = config[status] ?? config.PENDING
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.className, cfg.italic && 'italic', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
