'use client'

import type { ValidationResult } from '@/types'

const STYLES: Record<ValidationResult, { text: string; bg: string; border: string; label: string }> = {
  PASS: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Pass' },
  WARNING: { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Warning' },
  FAIL: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Fail' },
}

export function ValidationResultBadge({ result }: { result: ValidationResult }) {
  const s = STYLES[result]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${s.bg} ${s.border} ${s.text}`}
    >
      {s.label}
    </span>
  )
}
