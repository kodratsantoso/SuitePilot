'use client'
import type { SopStatus } from '@/types'

const COLORS: Record<SopStatus, string> = {
  DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
  IN_REVIEW: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  APPROVED: 'text-green-700 bg-green-50 border-green-200',
  PUBLISHED: 'text-blue-700 bg-blue-50 border-blue-200',
  ARCHIVED: 'text-gray-400 bg-gray-50 border-gray-100',
}

const LABELS: Record<SopStatus, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
}

export function SopStatusBadge({ status }: { status: SopStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  )
}
