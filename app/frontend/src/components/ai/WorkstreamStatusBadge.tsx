'use client'
import type { WorkstreamStatus } from '@/types'

const COLORS: Record<WorkstreamStatus, string> = {
  PLANNED: 'text-gray-600 bg-gray-50 border-gray-200',
  ACTIVE: 'text-blue-700 bg-blue-50 border-blue-200',
  BLOCKED: 'text-red-700 bg-red-50 border-red-200',
  COMPLETED: 'text-green-700 bg-green-50 border-green-200',
  ON_HOLD: 'text-yellow-700 bg-yellow-50 border-yellow-200',
}

const LABELS: Record<WorkstreamStatus, string> = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
}

export function WorkstreamStatusBadge({ status }: { status: WorkstreamStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  )
}
