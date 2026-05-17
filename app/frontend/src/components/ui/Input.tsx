import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder-gray-400',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        rows={3}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder-gray-400 resize-none',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <select
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm shadow-sm bg-white',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
