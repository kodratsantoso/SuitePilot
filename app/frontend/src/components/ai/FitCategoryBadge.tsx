'use client'
import type { FitCategory } from '@/types'

const COLORS: Record<FitCategory, string> = {
  FIT_STANDARD: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  FIT_WITH_CONFIGURATION: 'text-green-700 bg-green-50 border-green-200',
  FIT_WITH_WORKFLOW: 'text-teal-700 bg-teal-50 border-teal-200',
  FIT_WITH_CUSTOMIZATION: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  FIT_WITH_INTEGRATION: 'text-orange-700 bg-orange-50 border-orange-200',
  GAP: 'text-red-700 bg-red-50 border-red-200',
  OUT_OF_SCOPE: 'text-gray-500 bg-gray-50 border-gray-200',
}

const LABELS: Record<FitCategory, string> = {
  FIT_STANDARD: 'Fit (Standard)',
  FIT_WITH_CONFIGURATION: 'Fit (Config)',
  FIT_WITH_WORKFLOW: 'Fit (Workflow)',
  FIT_WITH_CUSTOMIZATION: 'Fit (Custom)',
  FIT_WITH_INTEGRATION: 'Fit (Integration)',
  GAP: 'Gap',
  OUT_OF_SCOPE: 'Out of Scope',
}

export function FitCategoryBadge({ category }: { category: FitCategory }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${COLORS[category]}`}>
      {LABELS[category]}
    </span>
  )
}
