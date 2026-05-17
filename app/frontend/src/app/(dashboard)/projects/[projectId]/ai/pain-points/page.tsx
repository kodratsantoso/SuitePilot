'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { usePainPointAnalysis, useRunPainPointAnalysis } from '@/hooks/usePainPointAnalysis'
import { usePainPoints } from '@/hooks/usePainPoints'
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge'
import { SeverityBadge } from '@/components/ai/SeverityBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import type { PainPointClassification, Severity } from '@/types'

function PainPointCard({ item }: { item: PainPointClassification }) {
  const [rootCauseExpanded, setRootCauseExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">
              {item.painPoint?.title ?? 'Pain Point'}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {item.category}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{formatDate(item.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SeverityBadge severity={item.severity as Severity} />
          <ConfidenceBadge score={item.confidenceScore} showLabel={false} />
        </div>
      </div>

      {item.recommendation && (
        <div className="mt-3 rounded-md bg-green-50 border border-green-100 px-3 py-2">
          <p className="text-xs font-medium text-green-800 mb-1">Recommendation</p>
          <p className="text-sm text-green-700">{item.recommendation}</p>
        </div>
      )}

      {item.rootCause && (
        <div className="mt-3">
          <button
            onClick={() => setRootCauseExpanded(!rootCauseExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${rootCauseExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Root Cause
          </button>
          {rootCauseExpanded && (
            <p className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">{item.rootCause}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function PainPointAnalysisPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: classifications = [], isLoading, error, refetch } = usePainPointAnalysis(projectId)
  const { data: painPoints = [] } = usePainPoints(projectId)
  const runAnalysis = useRunPainPointAnalysis(projectId)

  const hasPainPoints = painPoints.length > 0

  // Group by category
  const grouped = classifications.reduce<Record<string, PainPointClassification[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
  const categories = Object.keys(grouped).sort()

  return (
    <div>
      <PageHeader
        title="Pain Point Analysis"
        description="AI classification and analysis of identified pain points"
        action={
          <button
            onClick={() => runAnalysis.mutate(undefined)}
            disabled={runAnalysis.isPending || !hasPainPoints}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {runAnalysis.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Classifying...
              </>
            ) : (
              'Run AI Classification'
            )}
          </button>
        }
      />

      {!hasPainPoints && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Add pain points to this project before running classification.
          </p>
        </div>
      )}

      {runAnalysis.isPending && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-brand-700">AI is classifying pain points...</p>
        </div>
      )}

      {runAnalysis.isError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Classification failed: {(runAnalysis.error as Error)?.message ?? 'Unknown error'}
          </p>
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={(error as Error)?.message}
            retry={() => refetch()}
          />
        ) : classifications.length === 0 ? (
          <EmptyState
            title="No pain point analysis yet"
            description="Click 'Run AI Classification' to classify your pain points."
          />
        ) : (
          <div className="space-y-8">
            <p className="text-sm text-gray-500">{classifications.length} pain point{classifications.length !== 1 ? 's' : ''} classified</p>
            {categories.map((category) => (
              <div key={category}>
                <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {category}
                  </span>
                  <span className="text-gray-400 font-normal normal-case tracking-normal">
                    {grouped[category].length} item{grouped[category].length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {grouped[category].map((item) => (
                    <PainPointCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
