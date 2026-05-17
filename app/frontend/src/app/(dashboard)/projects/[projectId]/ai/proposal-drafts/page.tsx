'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProposalDrafts, useGenerateProposalDraft } from '@/hooks/useProposalDrafts'
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge'
import { AiOutputStatusBadge } from '@/components/ai/AiOutputStatusBadge'
import { AiOutputTypeBadge } from '@/components/ai/AiOutputTypeBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import type { AiGeneratedOutput, ProposalSectionType } from '@/types'

const SECTION_ORDER: ProposalSectionType[] = [
  'EXECUTIVE_SUMMARY',
  'CHALLENGES',
  'PROPOSED_SOLUTION',
  'SCOPE',
  'TIMELINE',
  'ASSUMPTIONS',
  'RISKS',
  'DELIVERABLES',
  'NEXT_STEPS',
]

const SECTION_LABELS: Record<ProposalSectionType, string> = {
  EXECUTIVE_SUMMARY: 'Executive Summary',
  CHALLENGES: 'Challenges',
  PROPOSED_SOLUTION: 'Proposed Solution',
  SCOPE: 'Scope',
  TIMELINE: 'Timeline',
  ASSUMPTIONS: 'Assumptions',
  RISKS: 'Risks',
  DELIVERABLES: 'Deliverables',
  NEXT_STEPS: 'Next Steps',
}

function ProposalDraftCard({ draft }: { draft: AiGeneratedOutput }) {
  const [expanded, setExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<ProposalSectionType>('EXECUTIVE_SUMMARY')

  // Try to parse sections from content (JSON or plain text)
  let parsedSections: Record<string, string> | null = null
  try {
    const parsed = JSON.parse(draft.content)
    if (typeof parsed === 'object' && parsed !== null) {
      parsedSections = parsed as Record<string, string>
    }
  } catch {
    // Not JSON, use plain text
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <button
        className="flex w-full items-start justify-between p-5 text-left hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">{draft.title}</h3>
            <span className="text-xs text-gray-400">v{draft.version}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <AiOutputTypeBadge outputType={draft.outputType} />
            <AiOutputStatusBadge status={draft.status} />
            <ConfidenceBadge score={draft.confidenceScore} showLabel={false} />
            <span className="text-xs text-gray-400">{formatDate(draft.createdAt)}</span>
          </div>
        </div>
        <svg
          className={`ml-3 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100">
          {parsedSections ? (
            <div className="flex min-h-[400px]">
              {/* Section navigation */}
              <nav className="w-48 flex-shrink-0 border-r border-gray-100 py-3">
                {SECTION_ORDER.map((section) => (
                  parsedSections![section] != null && (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`w-full px-4 py-2 text-left text-xs font-medium transition ${
                        activeSection === section
                          ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-600'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {SECTION_LABELS[section]}
                    </button>
                  )
                ))}
              </nav>

              {/* Section content */}
              <div className="flex-1 p-6 overflow-auto">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  {SECTION_LABELS[activeSection]}
                </h4>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                  {parsedSections[activeSection] ?? (
                    <span className="text-gray-400 italic">No content for this section</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{draft.content}</p>
            </div>
          )}

          {draft.reviews && draft.reviews.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Reviews</p>
              <div className="space-y-2">
                {draft.reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-2">
                    <AiOutputStatusBadge status={review.status as AiGeneratedOutput['status']} />
                    {review.reviewer && (
                      <span className="text-xs text-gray-500">{review.reviewer.name}</span>
                    )}
                    {review.comments && (
                      <span className="text-xs text-gray-600">— {review.comments}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProposalDraftsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: drafts = [], isLoading, error, refetch } = useProposalDrafts(projectId)
  const generateDraft = useGenerateProposalDraft(projectId)

  // Sort newest first
  const sorted = [...drafts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div>
      <PageHeader
        title="Proposal Drafts"
        description="AI-generated proposal documents for client delivery"
        action={
          <button
            onClick={() => generateDraft.mutate(undefined)}
            disabled={generateDraft.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {generateDraft.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Proposal Draft'
            )}
          </button>
        }
      />

      {generateDraft.isPending && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <svg className="h-4 w-4 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-brand-700">AI is generating proposal draft...</p>
        </div>
      )}

      {generateDraft.isError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Generation failed: {(generateDraft.error as Error)?.message ?? 'Unknown error'}
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
        ) : sorted.length === 0 ? (
          <EmptyState
            title="No proposal drafts yet"
            description="Click 'Generate Proposal Draft' to create an AI-powered proposal."
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {sorted.length} proposal draft{sorted.length !== 1 ? 's' : ''}
            </p>
            {sorted.map((draft) => (
              <ProposalDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
