import { cn } from '@/lib/utils'
import type { TaskPriority } from '@/types'

const priorityConfig: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  LOW: { label: 'Low', className: 'text-gray-500', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Medium', className: 'text-blue-600', dot: 'bg-blue-400' },
  HIGH: { label: 'High', className: 'text-orange-600', dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical', className: 'text-red-600', dot: 'bg-red-500' },
}

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  const cfg = priorityConfig[priority] ?? priorityConfig.MEDIUM
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
