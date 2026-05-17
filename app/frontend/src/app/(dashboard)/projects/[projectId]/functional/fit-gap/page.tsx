'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useFitGapAnalysis, useRunFitGap } from '@/hooks/useFitGap'
import type { FitCategory } from '@/types'
import { FitCategoryBadge } from '@/components/ai/FitCategoryBadge'
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'

const FIT_CATEGORIES: FitCategory[] = [
  'FIT_STANDARD', 'FIT_WITH_CONFIGURATION', 'FIT_WITH_WORKFLOW',
  'FIT_WITH_CUSTOMIZATION', 'FIT_WITH_INTEGRATION', 'GAP', 'OUT_OF_SCOPE',
]

const CATEGORY_LABELS: Record<FitCategory, string> = {
  FIT_STANDARD: 'Fit (Standard)',
  FIT_WITH_CONFIGURATION: 'Fit (Config)',
  FIT_WITH_WORKFLOW: 'Fit (Workflow)',
  FIT_WITH_CUSTOMIZATION: 'Fit (Custom)',
  FIT_WITH_INTEGRATION: 'Fit (Integration)',
  GAP: 'Gap',
  OUT_OF_SCOPE: 'Out of Scope',
}

export default function FitGapPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: analyses = [], isLoading, isError, refetch } = useFitGapAnalysis(projectId)
  const runFitGap = useRunFitGap(projectId)

  const [catFilter, setCatFilter] = useState<FitCategory | ''>('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [runError, setRunError] = useState('')

  const filtered = catFilter ? analyses.filter((a) => a.fitCategory === catFilter) : analyses

  const categoryCounts = FIT_CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat]: analyses.filter((a) => a.fitCategory === cat).length }),
    {} as Record<FitCategory, number>
  )

  async function handleRun() {
    setRunError('')
    try {
      await runFitGap.mutateAsync({})
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Failed to run analysis')
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  if (isLoading) return <LoadingState message="Loading fit-gap analysis..." />
  if (isError) return <div className="text-red-600 text-sm">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fit-Gap Analysis"
        description="AI-powered classification of requirements against NetSuite capabilities"
        action={
          <Button size="sm" onClick={handleRun} disabled={runFitGap.isPending}>
            {runFitGap.isPending ? 'Analyzing...' : 'Run AI Fit-Gap'}
          </Button>
        }
      />

      {runError && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{runError}</div>}
      {runFitGap.isPending && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          AI is classifying requirements against NetSuite capabilities...
        </div>
      )}

      {/* Summary by category */}
      {analyses.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {FIT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
              className={`rounded-lg border p-2 text-center transition-all ${catFilter === cat ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="text-xl font-bold text-gray-900">{categoryCounts[cat]}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{CATEGORY_LABELS[cat]}</div>
            </button>
          ))}
        </div>
      )}

      {/* Filter indicator */}
      {catFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtered by:</span>
          <FitCategoryBadge category={catFilter} />
          <button onClick={() => setCatFilter('')} className="text-xs text-gray-400 hover:text-gray-600">× Clear</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No fit-gap analysis yet"
          description="Add requirements first, then click 'Run AI Fit-Gap' to classify them against NetSuite capabilities."
          action={<Button size="sm" onClick={handleRun}>Run AI Fit-Gap</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expanded.has(item.id)
            return (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FitCategoryBadge category={item.fitCategory} />
                      {item.requirement && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${
                          item.requirement.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                          item.requirement.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>{item.requirement.priority}</span>
                      )}
                      <ConfidenceBadge score={item.confidenceScore} />
                    </div>
                    <div className="mt-1 font-medium text-gray-900 text-sm">
                      {item.requirement?.title ?? `Requirement ${item.requirementId.slice(0, 8)}`}
                    </div>
                    <p className={`mt-1 text-xs text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {item.rationale}
                    </p>
                    {!isExpanded && item.rationale.length > 120 && (
                      <button onClick={() => toggleExpand(item.id)} className="text-xs text-blue-600 mt-1">Read more</button>
                    )}
                  </div>
                  <button onClick={() => toggleExpand(item.id)} className="ml-3 text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">
                    {isExpanded ? '▲ Less' : '▼ More'}
                  </button>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {item.recommendation && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Recommendation</div>
                        <div className="text-sm text-gray-700">{item.recommendation}</div>
                      </div>
                    )}
                    {item.implementationImpact && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Implementation Impact</div>
                        <div className="text-sm text-gray-700">{item.implementationImpact}</div>
                      </div>
                    )}
                    {item.assumptions && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assumptions</div>
                        <div className="text-sm text-gray-700">{item.assumptions}</div>
                      </div>
                    )}
                    {item.risks && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Risks</div>
                        <div className="text-sm text-gray-700">{item.risks}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
