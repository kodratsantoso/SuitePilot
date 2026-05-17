'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAiGeneratedOutputs } from '@/hooks/useAiGeneratedOutputs'
import type { AiOutputType, AiOutputStatus } from '@/types'
import { AiOutputStatusBadge } from '@/components/ai/AiOutputStatusBadge'
import { AiOutputTypeBadge } from '@/components/ai/AiOutputTypeBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const OUTPUT_TYPES: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Types' },
  { value: 'DISCOVERY_SUMMARY', label: 'Discovery Summary' },
  { value: 'REQUIREMENT_ANALYSIS', label: 'Requirement Analysis' },
  { value: 'PAIN_POINT_ANALYSIS', label: 'Pain Point Analysis' },
  { value: 'MODULE_RECOMMENDATION', label: 'Module Recommendation' },
  { value: 'SCOPE_DRAFT', label: 'Scope Draft' },
  { value: 'PROPOSAL_DRAFT', label: 'Proposal Draft' },
  { value: 'BRD_DRAFT', label: 'BRD Draft' },
  { value: 'FIT_GAP_DRAFT', label: 'Fit-Gap Draft' },
  { value: 'RISK_SUMMARY', label: 'Risk Summary' },
  { value: 'MEETING_SUMMARY', label: 'Meeting Summary' },
]

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REVISED', label: 'Revised' },
  { value: 'PUBLISHED', label: 'Published' },
]

export default function GeneratedOutputsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const params: Record<string, string> = {}
  if (typeFilter) params.outputType = typeFilter
  if (statusFilter) params.status = statusFilter
  const queryParams = Object.keys(params).length > 0 ? params : undefined

  const { data: outputs = [], isLoading, isError, refetch } = useAiGeneratedOutputs(projectId, queryParams)

  return (
    <div>
      <PageHeader
        title="Generated Outputs"
        description={isLoading ? '' : `${outputs.length} output${outputs.length !== 1 ? 's' : ''}`}
      />

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {OUTPUT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {STATUS_FILTERS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && outputs.length === 0 && (
          <EmptyState
            title={typeFilter || statusFilter ? 'No outputs match your filters' : 'No generated outputs yet'}
            description={typeFilter || statusFilter ? 'Try different filters.' : 'AI-generated documents and analyses will appear here.'}
          />
        )}
        {!isLoading && !isError && outputs.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {outputs.map((output) => (
              <button
                key={output.id}
                onClick={() => router.push(`/projects/${projectId}/ai/generated-outputs/${output.id}`)}
                className="text-left rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <AiOutputTypeBadge outputType={output.outputType} />
                  <AiOutputStatusBadge status={output.status} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{output.title}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>v{output.version}</span>
                    {output.confidenceScore != null && (
                      <span>{Math.round(output.confidenceScore * 100)}% confidence</span>
                    )}
                  </div>
                  <span>{formatDate(output.createdAt)}</span>
                </div>
                {(output.generatedByAgent || output.generatedBySkill) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {output.generatedByAgent && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                        {output.generatedByAgent}
                      </span>
                    )}
                    {output.generatedBySkill && (
                      <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-600">
                        {output.generatedBySkill}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
