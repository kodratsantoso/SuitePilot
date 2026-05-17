'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRequirementAnalysis, useRunRequirementAnalysis } from '@/hooks/useRequirementAnalysis'
import { useRequirements } from '@/hooks/useRequirements'
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import type { RequirementAnalysis } from '@/types'

function AnalysisCard({ item }: { item: RequirementAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = item.analysis.length > 300

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">
              {item.requirement?.title ?? 'Requirement'}
            </h3>
            {item.requirement?.priority && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                item.requirement.priority === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : item.requirement.priority === 'HIGH'
                  ? 'bg-orange-100 text-orange-700'
                  : item.requirement.priority === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {item.requirement.priority}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{formatDate(item.createdAt)}</p>
        </div>
        <ConfidenceBadge score={item.confidenceScore} />
      </div>

      <div className="mt-3">
        <p className={`text-sm text-gray-700 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
          {item.analysis}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs text-brand-600 hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {item.generatedByAgent && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">Agent:</span>
          <span className="text-xs font-medium text-gray-600">{item.generatedByAgent}</span>
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

export default function RequirementAnalysisPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: analyses = [], isLoading, error, refetch } = useRequirementAnalysis(projectId)
  const { data: requirements = [] } = useRequirements(projectId)
  const runAnalysis = useRunRequirementAnalysis(projectId)

  const hasRequirements = requirements.length > 0

  return (
    <div>
      <PageHeader
        title="Requirement Analysis"
        description="AI-powered analysis of your project requirements"
        action={
          <button
            onClick={() => runAnalysis.mutate(undefined)}
            disabled={runAnalysis.isPending || !hasRequirements}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {runAnalysis.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              'Run AI Analysis'
            )}
          </button>
        }
      />

      {!hasRequirements && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Add requirements to this project before running analysis.
          </p>
        </div>
      )}

      {runAnalysis.isPending && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-brand-700">AI is analyzing requirements...</p>
        </div>
      )}

      {runAnalysis.isError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Analysis failed: {(runAnalysis.error as Error)?.message ?? 'Unknown error'}
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
        ) : analyses.length === 0 ? (
          <EmptyState
            title="No requirement analysis yet"
            description="Click 'Run AI Analysis' to analyze your requirements."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <p className="text-sm text-gray-500">{analyses.length} requirement{analyses.length !== 1 ? 's' : ''} analyzed</p>
            {analyses.map((item) => (
              <AnalysisCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
