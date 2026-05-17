'use client'

import { useParams } from 'next/navigation'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAiRegistry, useEvaluationCases, useEvaluationRuns, useKnowledgeSources } from '@/hooks/useRoadmapFoundation'
import { formatDate } from '@/lib/utils'

export default function AiWorkspaceSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const registry = useAiRegistry()
  const knowledge = useKnowledgeSources(projectId)
  const evaluationCases = useEvaluationCases(projectId)
  const evaluationRuns = useEvaluationRuns(projectId)

  const isLoading = registry.isLoading || knowledge.isLoading || evaluationCases.isLoading || evaluationRuns.isLoading
  const isError = registry.isError || knowledge.isError || evaluationCases.isError || evaluationRuns.isError

  return (
    <div>
      <PageHeader title="AI Workspace Settings" description="Agent registry, RAG sources, and evaluation controls for this project" />

      <div className="mt-6">
        {isLoading && <LoadingState />}
        {!isLoading && isError && (
          <ErrorState retry={() => {
            registry.refetch()
            knowledge.refetch()
            evaluationCases.refetch()
            evaluationRuns.refetch()
          }} />
        )}
        {!isLoading && !isError && (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Agent Registry</h2>
                <span className="text-xs text-gray-500">{registry.data?.agents.length ?? 0} agents</span>
              </div>
              <div className="mt-4 space-y-3">
                {(registry.data?.agents ?? []).slice(0, 8).map((agent) => (
                  <div key={agent.id} className="rounded-md border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.role}</div>
                      </div>
                      <span className={agent.isActive ? 'text-xs text-green-700' : 'text-xs text-gray-500'}>{agent.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                ))}
                {(registry.data?.agents.length ?? 0) === 0 && <p className="text-sm text-gray-500">No DB-backed agents registered yet.</p>}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Skill Registry</h2>
                <span className="text-xs text-gray-500">{registry.data?.skills.length ?? 0} skills</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(registry.data?.skills ?? []).slice(0, 12).map((skill) => (
                  <div key={skill.id} className="rounded-md bg-gray-50 px-3 py-2">
                    <div className="truncate text-sm font-medium text-gray-900">{skill.name}</div>
                    <div className="truncate text-xs text-gray-500">{skill.category}</div>
                  </div>
                ))}
                {(registry.data?.skills.length ?? 0) === 0 && <p className="text-sm text-gray-500">No DB-backed skills registered yet.</p>}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">RAG Knowledge Sources</h2>
                <span className="text-xs text-gray-500">{knowledge.data?.length ?? 0} sources</span>
              </div>
              <div className="mt-4 space-y-2">
                {(knowledge.data ?? []).map((source) => (
                  <div key={source.id} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{source.name}</div>
                      <div className="text-xs text-gray-500">{source.category} · {source._count?.documents ?? 0} documents</div>
                    </div>
                    <span className="text-xs text-gray-500">{source.status}</span>
                  </div>
                ))}
                {(knowledge.data?.length ?? 0) === 0 && <p className="text-sm text-gray-500">No active project knowledge sources yet.</p>}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Evaluation Controls</h2>
                <span className="text-xs text-gray-500">{evaluationCases.data?.length ?? 0} cases</span>
              </div>
              <div className="mt-4 space-y-3">
                {(evaluationRuns.data ?? []).slice(0, 5).map((run) => (
                  <div key={run.id} className="rounded-md border border-gray-100 p-3">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-900">{run.evaluationCase?.skillName ?? 'Evaluation run'}</span>
                      <span className="text-gray-500">{run.score ?? '-'} / 100</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>{run.status.replaceAll('_', ' ')}</span>
                      <span>{formatDate(run.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {(evaluationRuns.data?.length ?? 0) === 0 && <p className="text-sm text-gray-500">No evaluation runs captured yet.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
