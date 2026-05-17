'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useModuleRecommendations, useRunModuleRecommendations } from '@/hooks/useModuleRecommendations'
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import type { ModuleRecommendationAnalysis } from '@/types'

function ModuleCard({ item, index }: { item: ModuleRecommendationAnalysis; index: number }) {
  const [assumptionsExpanded, setAssumptionsExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">{item.moduleName}</h3>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {item.impactedArea && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  {item.impactedArea}
                </span>
              )}
              <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
        <ConfidenceBadge score={item.confidenceScore} showLabel={false} />
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 mb-1">Rationale</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.rationale}</p>
      </div>

      {item.implementationImpact && (
        <div className="mt-3 rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
          <p className="text-xs font-medium text-blue-800 mb-1">Implementation Impact</p>
          <p className="text-sm text-blue-700">{item.implementationImpact}</p>
        </div>
      )}

      {item.assumptions && (
        <div className="mt-3">
          <button
            onClick={() => setAssumptionsExpanded(!assumptionsExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${assumptionsExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Assumptions
          </button>
          {assumptionsExpanded && (
            <p className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">{item.assumptions}</p>
          )}
        </div>
      )}

      {item.generatedByAgent && (
        <div className="mt-3 border-t border-gray-100 pt-2 flex items-center gap-2">
          <span className="text-xs text-gray-400">Agent: {item.generatedByAgent}</span>
          {item.generatedBySkill && (
            <>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">Skill: {item.generatedBySkill}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function ModuleRecommendationsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: recommendations = [], isLoading, error, refetch } = useModuleRecommendations(projectId)
  const runRecommendations = useRunModuleRecommendations(projectId)

  return (
    <div>
      <PageHeader
        title="Module Recommendations"
        description="AI-recommended NetSuite modules based on discovery findings"
        action={
          <button
            onClick={() => runRecommendations.mutate(undefined)}
            disabled={runRecommendations.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {runRecommendations.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Recommendations'
            )}
          </button>
        }
      />

      {runRecommendations.isPending && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-brand-700">AI is generating module recommendations...</p>
        </div>
      )}

      {runRecommendations.isError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Generation failed: {(runRecommendations.error as Error)?.message ?? 'Unknown error'}
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
        ) : recommendations.length === 0 ? (
          <EmptyState
            title="No module recommendations yet"
            description="Click 'Generate Recommendations' to get AI-powered module suggestions."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <p className="text-sm text-gray-500">
              {recommendations.length} module{recommendations.length !== 1 ? 's' : ''} recommended
            </p>
            {recommendations.map((item, index) => (
              <ModuleCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
