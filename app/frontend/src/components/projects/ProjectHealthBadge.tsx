import { cn } from '@/lib/utils'
import type { ProjectHealth } from '@/types'

const healthConfig: Record<ProjectHealth, { label: string; className: string; dot: string }> = {
  GREEN: {
    label: 'Green',
    className: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
  AMBER: {
    label: 'Amber',
    className: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  RED: {
    label: 'Red',
    className: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  UNKNOWN: {
    label: 'Unknown',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
}

interface ProjectHealthBadgeProps {
  health: ProjectHealth
  className?: string
}

export function ProjectHealthBadge({ health, className }: ProjectHealthBadgeProps) {
  const config = healthConfig[health] ?? healthConfig.UNKNOWN
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
