import { cn } from '@/lib/utils'
import type { DiscoverySessionStatus } from '@/types'

const statusConfig: Record<DiscoverySessionStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  ACTIVE: { label: 'Active', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-400' },
}

export function DiscoverySessionStatusBadge({
  status,
  className,
}: {
  status: DiscoverySessionStatus
  className?: string
}) {
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
