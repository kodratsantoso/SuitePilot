import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  PLANNED: { label: 'Planned', className: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  ON_HOLD: { label: 'On Hold', className: 'bg-yellow-100 text-yellow-700' },
  AT_RISK: { label: 'At Risk', className: 'bg-orange-100 text-orange-700' },
  DELAYED: { label: 'Delayed', className: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completed', className: 'bg-purple-100 text-purple-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 line-through' },
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
