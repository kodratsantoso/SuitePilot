import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this data. Please try again.',
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
