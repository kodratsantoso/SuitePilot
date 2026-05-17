'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useScopeEstimations, useRunScopeEstimation } from '@/hooks/useScopeEstimation'
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge'
import { ComplexityBadge } from '@/components/ai/ComplexityBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import type { ScopeEstimation } from '@/types'

function Section({ title, content, defaultOpen = false }: { title: string; content: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
      )}
    </div>
  )
}

function ScopeCard({ estimation, isLatest }: { estimation: ScopeEstimation; isLatest: boolean }) {
  return (
    <div className={`rounded-lg border bg-white p-6 ${isLatest ? 'border-brand-200 shadow-sm' : 'border-gray-200'}`}>
      {isLatest && (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            Latest Estimate
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <ComplexityBadge complexity={estimation.estimatedComplexity} large={isLatest} />
            <ConfidenceBadge score={estimation.confidenceScore} />
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{formatDate(estimation.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 mb-1">Scope Summary</p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{estimation.scopeSummary}</p>
      </div>

      {estimation.implementationApproach && (
        <div className="mt-4 rounded-md bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-xs font-medium text-blue-800 mb-1">Implementation Approach</p>
          <p className="text-sm text-blue-700 leading-relaxed">{estimation.implementationApproach}</p>
        </div>
      )}

      {estimation.assumptions && (
        <div className="mt-4">
          <Section title="Assumptions" content={estimation.assumptions} defaultOpen={isLatest} />
        </div>
      )}

      {estimation.exclusions && (
        <div className="mt-0">
          <Section title="Exclusions" content={estimation.exclusions} />
        </div>
      )}

      {estimation.risks && (
        <div className="mt-0">
          <Section title="Risks" content={estimation.risks} />
        </div>
      )}

      {estimation.generatedByAgent && (
        <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
          Agent: {estimation.generatedByAgent}
        </div>
      )}
    </div>
  )
}

export default function ScopeEstimationPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: estimations = [], isLoading, error, refetch } = useScopeEstimations(projectId)
  const runEstimation = useRunScopeEstimation(projectId)

  // Sort newest first
  const sorted = [...estimations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const [latest, ...older] = sorted
  const [showOlder, setShowOlder] = useState(false)

  return (
    <div>
      <PageHeader
        title="Scope Estimation"
        description="AI-generated project scope estimates based on discovery data"
        action={
          <button
            onClick={() => runEstimation.mutate(undefined)}
            disabled={runEstimation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {runEstimation.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Estimating...
              </>
            ) : (
              'Generate Scope Estimate'
            )}
          </button>
        }
      />

      {runEstimation.isPending && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-brand-700">AI is estimating project scope...</p>
        </div>
      )}

      {runEstimation.isError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Estimation failed: {(runEstimation.error as Error)?.message ?? 'Unknown error'}
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
        ) : estimations.length === 0 ? (
          <EmptyState
            title="No scope estimation yet"
            description="Click 'Generate Scope Estimate' to get an AI-powered scope estimate."
          />
        ) : (
          <div className="space-y-6">
            {latest && <ScopeCard estimation={latest} isLatest />}

            {older.length > 0 && (
              <div>
                <button
                  onClick={() => setShowOlder(!showOlder)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${showOlder ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showOlder ? 'Hide' : 'Show'} {older.length} previous estimate{older.length !== 1 ? 's' : ''}
                </button>

                {showOlder && (
                  <div className="mt-4 space-y-4">
                    {older.map((est) => (
                      <ScopeCard key={est.id} estimation={est} isLatest={false} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
