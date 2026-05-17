import { cn } from '@/lib/utils'
import type { AiOutputStatus } from '@/types'

const statusConfig: Record<AiOutputStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  IN_REVIEW: { label: 'In Review', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  REVISED: { label: 'Revised', className: 'bg-orange-100 text-orange-700' },
  PUBLISHED: { label: 'Published', className: 'bg-purple-100 text-purple-700' },
}

export function AiOutputStatusBadge({
  status,
  className,
}: {
  status: AiOutputStatus
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
