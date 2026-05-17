'use client'
import type { TechnicalStatus } from '@/types'

const COLORS: Record<TechnicalStatus, string> = {
  DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
  IN_REVIEW: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  APPROVED: 'text-green-700 bg-green-50 border-green-200',
  REJECTED: 'text-red-700 bg-red-50 border-red-200',
  PUBLISHED: 'text-blue-700 bg-blue-50 border-blue-200',
}

export function TechnicalStatusBadge({ status }: { status: TechnicalStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${COLORS[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
