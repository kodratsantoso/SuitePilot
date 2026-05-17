import { cn } from '@/lib/utils'
import type { RaidType, RaidStatus } from '@/types'

const typeConfig: Record<RaidType, { label: string; className: string }> = {
  RISK: { label: 'Risk', className: 'bg-red-100 text-red-700' },
  ASSUMPTION: { label: 'Assumption', className: 'bg-blue-100 text-blue-700' },
  ISSUE: { label: 'Issue', className: 'bg-orange-100 text-orange-700' },
  DEPENDENCY: { label: 'Dependency', className: 'bg-purple-100 text-purple-700' },
  DECISION: { label: 'Decision', className: 'bg-yellow-100 text-yellow-700' },
}

const statusConfig: Record<RaidStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-red-50 text-red-600' },
  MONITORING: { label: 'Monitoring', className: 'bg-yellow-50 text-yellow-700' },
  MITIGATED: { label: 'Mitigated', className: 'bg-blue-50 text-blue-600' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-50 text-green-700' },
  CLOSED: { label: 'Closed', className: 'bg-gray-50 text-gray-500' },
  ESCALATED: { label: 'Escalated', className: 'bg-orange-50 text-orange-700' },
}

export function RaidTypeBadge({ type, className }: { type: RaidType; className?: string }) {
  const cfg = typeConfig[type] ?? { label: type, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}

export function RaidStatusBadge({ status, className }: { status: RaidStatus; className?: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-50 text-gray-600' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}
