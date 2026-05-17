import { cn } from '@/lib/utils'
import type { Severity } from '@/types'

const severityConfig: Record<Severity, { label: string; className: string; dot: string }> = {
  LOW: { label: 'Low', className: 'text-green-600', dot: 'bg-green-400' },
  MEDIUM: { label: 'Medium', className: 'text-yellow-600', dot: 'bg-yellow-400' },
  HIGH: { label: 'High', className: 'text-orange-600', dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical', className: 'text-red-600', dot: 'bg-red-500' },
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  const cfg = severityConfig[severity] ?? severityConfig.MEDIUM
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
