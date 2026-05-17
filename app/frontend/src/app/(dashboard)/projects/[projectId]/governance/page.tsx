'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useRagStatus, useGovernanceEvents, useReviewGates } from '@/hooks/useGovernance'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { RagStatusBadge } from '@/components/ai/RagStatusBadge'
import type { GovernanceEventType, RagStatusItem } from '@/types'

const EVENT_TYPE_STYLES: Record<GovernanceEventType, { bg: string; text: string; border: string; label: string }> = {
  HALLUCINATION_DETECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Hallucination Detected' },
  VALIDATION_PASSED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Validation Passed' },
  VALIDATION_FAILED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Validation Failed' },
  REVIEW_SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Review Submitted' },
  QUALITY_SCORE_ASSIGNED: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Quality Score Assigned' },
}

function StatCard({ label, value, color, sub }: { label: string; value: number | string; color?: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className={`text-4xl font-bold ${color ?? 'text-gray-900'}`}>{value}</div>
      <div className="mt-1 text-sm font-medium text-gray-700">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function NavCard({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">{title}</div>
        <div className="mt-0.5 text-xs text-gray-500">{description}</div>
      </div>
    </Link>
  )
}

function RedOutputCard({ item }: { item: RagStatusItem }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-red-900 truncate">{item.outputTitle}</div>
        <div className="text-xs text-red-600 mt-0.5">{item.outputType.replace(/_/g, ' ')}</div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {item.confidenceScore != null && (
          <span className="text-xs text-red-700 font-medium">{item.confidenceScore}% confidence</span>
        )}
        {item.hasHallucination && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300">
            Hallucination
          </span>
        )}
      </div>
    </div>
  )
}

export default function GovernanceDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const base = `/projects/${projectId}/governance`

  const { data: ragReport, isLoading: ragLoading } = useRagStatus(projectId)
  const { data: events = [], isLoading: eventsLoading } = useGovernanceEvents(projectId, { limit: '10' })
  const { data: gates = [], isLoading: gatesLoading } = useReviewGates(projectId, { status: 'PENDING' })

  const isLoading = ragLoading || eventsLoading || gatesLoading

  if (isLoading) return <LoadingState message="Loading governance dashboard..." />

  const summary = ragReport?.summary ?? { total: 0, green: 0, amber: 0, red: 0 }
  const total = summary.total
  const greenPct = total > 0 ? (summary.green / total) * 100 : 0
  const amberPct = total > 0 ? (summary.amber / total) * 100 : 0
  const redPct = total > 0 ? (summary.red / total) * 100 : 0

  const redItems = ragReport?.items.filter((i) => i.ragStatus === 'RED') ?? []
  const recentEvents = events.slice(0, 10)
  const pendingGates = gates.filter((g) => g.status === 'PENDING')

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="AI Governance"
        description="RAG status overview, validation events, and review gate tracking for all AI-generated outputs."
      />

      {/* RAG Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Green (Compliant)" value={summary.green} color="text-green-600" sub="Outputs with no issues" />
        <StatCard label="Amber (Warning)" value={summary.amber} color="text-yellow-600" sub="Outputs needing attention" />
        <StatCard label="Red (Critical)" value={summary.red} color="text-red-600" sub="Outputs requiring immediate review" />
      </div>

      {/* RAG Bar */}
      {total > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">RAG Distribution — {total} AI Output{total !== 1 ? 's' : ''}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />Green</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />Amber</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />Red</span>
            </div>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            <div className="bg-green-500 transition-all" style={{ width: `${greenPct}%` }} />
            <div className="bg-yellow-400 transition-all" style={{ width: `${amberPct}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${redPct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{summary.green} green ({Math.round(greenPct)}%)</span>
            <span>{summary.amber} amber ({Math.round(amberPct)}%)</span>
            <span>{summary.red} red ({Math.round(redPct)}%)</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="h-4 rounded-full bg-gray-100 w-full" />
          <p className="text-xs text-gray-400 mt-2 text-center">No AI outputs tracked yet</p>
        </div>
      )}

      {/* Red Alert Section */}
      {redItems.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M8 2l6 12H2L8 2z" />
              <path strokeLinecap="round" d="M8 7v3M8 11.5v.5" />
            </svg>
            {redItems.length} Output{redItems.length !== 1 ? 's' : ''} Requiring Immediate Attention
          </h2>
          <div className="flex flex-col gap-2">
            {redItems.map((item) => (
              <RedOutputCard key={item.outputId} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Governance Events */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Governance Events</h2>
          </div>
          {recentEvents.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No governance events recorded yet.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentEvents.map((event) => {
                const style = EVENT_TYPE_STYLES[event.eventType]
                return (
                  <li key={event.id} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className={`mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${style.bg} ${style.text} ${style.border}`}
                    >
                      {style.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      {event.agentName && (
                        <span className="text-xs font-medium text-gray-700">{event.agentName}</span>
                      )}
                      {event.notes && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{event.notes}</p>
                      )}
                      {event.output && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{event.output.title}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Pending Review Gates */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Pending Review Gates</h2>
          </div>
          {pendingGates.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No pending review gates.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {pendingGates.map((gate) => (
                <li key={gate.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    {gate.output && (
                      <p className="text-sm font-medium text-gray-900 truncate">{gate.output.title}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">{gate.stage.replace(/_/g, ' ')}</p>
                    {gate.reviewer && (
                      <p className="text-xs text-gray-400 mt-0.5">Reviewer: {gate.reviewer.name}</p>
                    )}
                  </div>
                  <RagStatusBadge status="AMBER" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NavCard
          href={`${base}/validations`}
          title="Output Validations"
          description="Schema checks, data consistency, and business rule validations for AI outputs."
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M4 8l3 3 5-5" />
              <circle cx="8" cy="8" r="6" />
            </svg>
          }
        />
        <NavCard
          href={`${base}/review-gates`}
          title="Review Gates"
          description="Track AI self-validation, peer review, human review, and governance approval stages."
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M8 2l1.5 3h3l-2.5 2 1 3L8 8.5 5 10l1-3L3.5 5h3z" />
              <circle cx="8" cy="13" r="1" fill="currentColor" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
