'use client'

import type { EstimatedComplexity } from '@/types'

const COLORS: Record<EstimatedComplexity, string> = {
  LOW: 'text-green-700 bg-green-50 border-green-200',
  MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
  VERY_HIGH: 'text-red-700 bg-red-50 border-red-200',
}

const LABELS: Record<EstimatedComplexity, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  VERY_HIGH: 'Very High',
}

export function ComplexityBadge({ complexity, large }: { complexity: EstimatedComplexity; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${COLORS[complexity]} ${
        large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {LABELS[complexity]}
    </span>
  )
}
