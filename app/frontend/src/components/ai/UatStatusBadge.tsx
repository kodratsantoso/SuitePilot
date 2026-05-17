'use client'
import type { UatScenarioStatus } from '@/types'

const COLORS: Record<UatScenarioStatus, string> = {
  DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
  READY: 'text-blue-700 bg-blue-50 border-blue-200',
  IN_TESTING: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  PASSED: 'text-green-700 bg-green-50 border-green-200',
  FAILED: 'text-red-700 bg-red-50 border-red-200',
  RETEST_REQUIRED: 'text-orange-700 bg-orange-50 border-orange-200',
}

const LABELS: Record<UatScenarioStatus, string> = {
  DRAFT: 'Draft',
  READY: 'Ready',
  IN_TESTING: 'In Testing',
  PASSED: 'Passed',
  FAILED: 'Failed',
  RETEST_REQUIRED: 'Retest',
}

export function UatStatusBadge({ status }: { status: UatScenarioStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  )
}
