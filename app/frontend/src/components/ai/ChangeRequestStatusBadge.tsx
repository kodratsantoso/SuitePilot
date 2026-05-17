import { cn } from '@/lib/utils'
import type { ChangeRequestStatus } from '@/types'

const config: Record<ChangeRequestStatus, { label: string; className: string; dot: string }> = {
  PROPOSED:    { label: 'Proposed',    className: 'text-gray-600',   dot: 'bg-gray-400' },
  IN_REVIEW:   { label: 'In Review',   className: 'text-yellow-600', dot: 'bg-yellow-400' },
  APPROVED:    { label: 'Approved',    className: 'text-green-600',  dot: 'bg-green-500' },
  REJECTED:    { label: 'Rejected',    className: 'text-red-600',    dot: 'bg-red-500' },
  IMPLEMENTED: { label: 'Implemented', className: 'text-blue-600',   dot: 'bg-blue-400' },
}

export function ChangeRequestStatusBadge({
  status,
  className,
}: {
  status: ChangeRequestStatus
  className?: string
}) {
  const cfg = config[status] ?? config.PROPOSED
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
