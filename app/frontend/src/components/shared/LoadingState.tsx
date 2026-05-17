import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="flex items-center gap-3 text-gray-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex animate-pulse gap-4 rounded-lg border border-gray-100 bg-white p-4">
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-1/4 rounded bg-gray-200" />
      <div className="h-4 w-1/6 rounded bg-gray-200" />
    </div>
  )
}
