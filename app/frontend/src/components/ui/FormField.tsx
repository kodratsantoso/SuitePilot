import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      )}
      {children}
    </div>
  )
}
