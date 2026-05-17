'use client'

import type { RagStatus } from '@/types'

const STYLES: Record<RagStatus, { dot: string; text: string; bg: string; border: string }> = {
  GREEN: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  AMBER: { dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  RED: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

export function RagStatusBadge({ status, size = 'sm' }: { status: RagStatus; size?: 'sm' | 'lg' }) {
  const s = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.text} ${
        size === 'lg' ? 'text-sm font-semibold' : 'text-xs font-medium'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}
