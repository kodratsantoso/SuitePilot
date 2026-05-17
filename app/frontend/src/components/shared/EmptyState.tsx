import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, className, icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
