'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDiscoverySessions } from '@/hooks/useDiscoverySessions'
import { useAiConversations } from '@/hooks/useAiConversations'
import { useAiGeneratedOutputs } from '@/hooks/useAiGeneratedOutputs'
import { useRequirementAnalysis, useRunRequirementAnalysis } from '@/hooks/useRequirementAnalysis'
import { useModuleRecommendations, useRunModuleRecommendations } from '@/hooks/useModuleRecommendations'
import { useScopeEstimations, useRunScopeEstimation } from '@/hooks/useScopeEstimation'
import { useProposalDrafts, useGenerateProposalDraft } from '@/hooks/useProposalDrafts'
import { DiscoverySessionStatusBadge } from '@/components/ai/DiscoverySessionStatusBadge'
import { AiOutputStatusBadge } from '@/components/ai/AiOutputStatusBadge'
import { AiOutputTypeBadge } from '@/components/ai/AiOutputTypeBadge'
import { ComplexityBadge } from '@/components/ai/ComplexityBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { formatDate } from '@/lib/utils'

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </Link>
  )
}

function QuickActionButton({
  label,
  description,
  onClick,
  isPending,
  href,
}: {
  label: string
  description: string
  onClick?: () => void
  isPending?: boolean
  href: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition flex flex-col justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {onClick && (
          <button
            onClick={onClick}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {isPending ? (
              <>
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running...
              </>
            ) : (
              'Run'
            )}
          </button>
        )}
        <Link href={href} className="text-xs text-brand-600 hover:underline">
          View
        </Link>
      </div>
    </div>
  )
}

export default function AiWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: sessions = [], isLoading: loadingSessions } = useDiscoverySessions(projectId)
  const { data: conversations = [], isLoading: loadingConversations } = useAiConversations(projectId)
  const { data: outputs = [], isLoading: loadingOutputs } = useAiGeneratedOutputs(projectId)

  const { data: requirementAnalyses = [] } = useRequirementAnalysis(projectId)
  const { data: moduleRecs = [] } = useModuleRecommendations(projectId)
  const { data: scopeEstimations = [] } = useScopeEstimations(projectId)
  const { data: proposalDrafts = [] } = useProposalDrafts(projectId)

  const runReqAnalysis = useRunRequirementAnalysis(projectId)
  const runModuleRecs = useRunModuleRecommendations(projectId)
  const runScopeEst = useRunScopeEstimation(projectId)
  const generateProposal = useGenerateProposalDraft(projectId)

  const pendingReviews = outputs.filter(
    (o) => o.status === 'IN_REVIEW' || o.status === 'DRAFT'
  ).length

  const latestScope = [...scopeEstimations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]

  const isLoading = loadingSessions || loadingConversations || loadingOutputs
  const base = `/projects/${projectId}/ai`

  const navItems = [
    { href: `${base}/discovery`, label: 'Discovery Sessions', description: 'Manage structured discovery Q&A sessions' },
    { href: `${base}/conversations`, label: 'AI Conversations', description: 'Stored AI agent conversation threads' },
    { href: `${base}/generated-outputs`, label: 'Generated Outputs', description: 'AI-generated documents and analyses' },
    { href: `${base}/reviews`, label: 'Review Queue', description: 'Outputs pending your review and approval' },
    { href: `${base}/settings`, label: 'Settings', description: 'AI workspace configuration' },
  ]

  return (
    <div>
      <PageHeader
        title="AI Workspace"
        description="Discovery sessions, AI conversations, and generated document management"
      />

      {isLoading ? (
        <div className="mt-8">
          <LoadingState />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Discovery Sessions" value={sessions.length} href={`${base}/discovery`} />
            <StatCard label="Conversations" value={conversations.length} href={`${base}/conversations`} />
            <StatCard label="Generated Outputs" value={outputs.length} href={`${base}/generated-outputs`} />
            <StatCard label="Pending Reviews" value={pendingReviews} href={`${base}/reviews`} />
          </div>

          {/* Presales Intelligence section */}
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Presales Intelligence</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                href={`${base}/requirements`}
                className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
              >
                <p className="text-sm text-gray-500">Analyses Run</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{requirementAnalyses.length}</p>
              </Link>
              <Link
                href={`${base}/module-recommendations`}
                className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
              >
                <p className="text-sm text-gray-500">Modules Recommended</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{moduleRecs.length}</p>
              </Link>
              <Link
                href={`${base}/scope-estimation`}
                className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
              >
                <p className="text-sm text-gray-500">Scope Estimated</p>
                {latestScope ? (
                  <div className="mt-2">
                    <ComplexityBadge complexity={latestScope.estimatedComplexity} />
                  </div>
                ) : (
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{scopeEstimations.length}</p>
                )}
              </Link>
              <Link
                href={`${base}/proposal-drafts`}
                className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
              >
                <p className="text-sm text-gray-500">Proposals Generated</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{proposalDrafts.length}</p>
              </Link>
            </div>

            {/* Quick actions */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickActionButton
                label="Analyze Requirements"
                description="AI analysis of project requirements"
                onClick={() => runReqAnalysis.mutate(undefined)}
                isPending={runReqAnalysis.isPending}
                href={`${base}/requirements`}
              />
              <QuickActionButton
                label="Recommend Modules"
                description="AI-recommended NetSuite modules"
                onClick={() => runModuleRecs.mutate(undefined)}
                isPending={runModuleRecs.isPending}
                href={`${base}/module-recommendations`}
              />
              <QuickActionButton
                label="Estimate Scope"
                description="AI-generated project scope estimate"
                onClick={() => runScopeEst.mutate(undefined)}
                isPending={runScopeEst.isPending}
                href={`${base}/scope-estimation`}
              />
              <QuickActionButton
                label="Generate Proposal"
                description="AI-drafted proposal document"
                onClick={() => generateProposal.mutate(undefined)}
                isPending={generateProposal.isPending}
                href={`${base}/proposal-drafts`}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Discovery Sessions */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Recent Discovery Sessions</h2>
                <Link href={`${base}/discovery`} className="text-xs text-brand-600 hover:underline">
                  View all
                </Link>
              </div>
              {sessions.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">No discovery sessions yet</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {sessions.slice(0, 5).map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`${base}/discovery/${s.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
                        </div>
                        <DiscoverySessionStatusBadge status={s.status} className="ml-3 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Generated Outputs */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Recent Generated Outputs</h2>
                <Link href={`${base}/generated-outputs`} className="text-xs text-brand-600 hover:underline">
                  View all
                </Link>
              </div>
              {outputs.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">No generated outputs yet</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {outputs.slice(0, 5).map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`${base}/generated-outputs/${o.id}`}
                        className="flex items-start justify-between px-5 py-3 hover:bg-gray-50 transition"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{o.title}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <AiOutputTypeBadge outputType={o.outputType} />
                            <span className="text-xs text-gray-400">v{o.version}</span>
                          </div>
                        </div>
                        <AiOutputStatusBadge status={o.status} className="ml-3 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Navigation cards */}
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Workspace Sections</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
                >
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Presales navigation cards */}
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Presales Tools</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: `${base}/requirements`, label: 'Requirements Analysis', description: 'AI analysis of project requirements' },
                { href: `${base}/pain-points`, label: 'Pain Point Analysis', description: 'AI classification of pain points by category' },
                { href: `${base}/module-recommendations`, label: 'Module Recommendations', description: 'AI-recommended NetSuite modules' },
                { href: `${base}/scope-estimation`, label: 'Scope Estimation', description: 'AI-generated scope and complexity estimate' },
                { href: `${base}/proposal-drafts`, label: 'Proposal Drafts', description: 'AI-drafted proposal documents' },
                { href: `${base}/module-catalog`, label: 'Module Catalog', description: 'Browse all NetSuite modules' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
                >
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
