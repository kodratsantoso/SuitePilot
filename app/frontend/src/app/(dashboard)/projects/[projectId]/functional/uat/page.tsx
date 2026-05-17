'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useUatScenarios, useGenerateUat, useUpdateUatScenario } from '@/hooks/useUatScenarios'
import { useWorkstreams } from '@/hooks/useWorkstreams'
import type { UatScenarioStatus, UatCategory } from '@/types'
import { UatStatusBadge } from '@/components/ai/UatStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'

const CATEGORY_LABELS: Record<UatCategory, string> = {
  POSITIVE_TEST: 'Positive',
  NEGATIVE_TEST: 'Negative',
  APPROVAL_TEST: 'Approval',
  INTEGRATION_TEST: 'Integration',
  REGRESSION_TEST: 'Regression',
  SECURITY_TEST: 'Security',
}

const CATEGORY_COLORS: Record<UatCategory, string> = {
  POSITIVE_TEST: 'bg-green-50 text-green-700 border-green-200',
  NEGATIVE_TEST: 'bg-red-50 text-red-700 border-red-200',
  APPROVAL_TEST: 'bg-purple-50 text-purple-700 border-purple-200',
  INTEGRATION_TEST: 'bg-blue-50 text-blue-700 border-blue-200',
  REGRESSION_TEST: 'bg-orange-50 text-orange-700 border-orange-200',
  SECURITY_TEST: 'bg-gray-50 text-gray-700 border-gray-200',
}

const STATUS_OPTIONS: UatScenarioStatus[] = ['DRAFT', 'READY', 'IN_TESTING', 'PASSED', 'FAILED', 'RETEST_REQUIRED']

export default function UatPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: scenarios = [], isLoading, isError, refetch } = useUatScenarios(projectId)
  const { data: workstreams = [] } = useWorkstreams(projectId)
  const generateUat = useGenerateUat(projectId)
  const updateScenario = useUpdateUatScenario(projectId)

  const [statusFilter, setStatusFilter] = useState<UatScenarioStatus | ''>('')
  const [wsFilter, setWsFilter] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [runError, setRunError] = useState('')

  const filtered = scenarios.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false
    if (wsFilter && s.workstreamId !== wsFilter) return false
    return true
  })

  const statCounts = {
    total: scenarios.length,
    passed: scenarios.filter((s) => s.status === 'PASSED').length,
    failed: scenarios.filter((s) => s.status === 'FAILED').length,
    inTesting: scenarios.filter((s) => s.status === 'IN_TESTING').length,
  }

  async function handleGenerate() {
    setRunError('')
    try {
      await generateUat.mutateAsync({ scenarioCount: 8 })
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Failed to generate UAT')
    }
  }

  async function handleStatusChange(scenarioId: string, status: UatScenarioStatus) {
    await updateScenario.mutateAsync({ scenarioId, data: { status } })
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  if (isLoading) return <LoadingState message="Loading UAT scenarios..." />
  if (isError) return <div className="text-red-600 text-sm">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="UAT Scenarios"
        description="AI-generated test scenarios for user acceptance testing"
        action={
          <Button size="sm" onClick={handleGenerate} disabled={generateUat.isPending}>
            {generateUat.isPending ? 'Generating...' : 'Generate UAT Scenarios'}
          </Button>
        }
      />

      {runError && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{runError}</div>}
      {generateUat.isPending && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          AI is generating comprehensive UAT scenarios...
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: statCounts.total, color: 'text-gray-900' },
            { label: 'In Testing', value: statCounts.inTesting, color: 'text-yellow-700' },
            { label: 'Passed', value: statCounts.passed, color: 'text-green-700' },
            { label: 'Failed', value: statCounts.failed, color: 'text-red-700' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select className="rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UatScenarioStatus | '')}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={wsFilter} onChange={(e) => setWsFilter(e.target.value)}>
          <option value="">All Workstreams</option>
          {workstreams.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No UAT scenarios yet" description="Generate AI test scenarios based on your requirements and fit-gap analysis." action={<Button size="sm" onClick={handleGenerate}>Generate UAT Scenarios</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((scenario) => {
            const isExpanded = expanded.has(scenario.id)
            return (
              <div key={scenario.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${CATEGORY_COLORS[scenario.category]}`}>
                        {CATEGORY_LABELS[scenario.category]}
                      </span>
                      <UatStatusBadge status={scenario.status} />
                      {scenario.affectedModule && (
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{scenario.affectedModule}</span>
                      )}
                    </div>
                    <div className="font-medium text-gray-900 text-sm">{scenario.title}</div>
                    {scenario.businessObjective && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{scenario.businessObjective}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <select
                      value={scenario.status}
                      onChange={(e) => handleStatusChange(scenario.id, e.target.value as UatScenarioStatus)}
                      className="text-xs rounded border border-gray-200 px-1.5 py-0.5 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <button onClick={() => toggleExpand(scenario.id)} className="text-xs text-gray-400 hover:text-gray-600">
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {scenario.precondition && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Preconditions</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{scenario.precondition}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Test Steps</div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono text-xs bg-white rounded border border-gray-100 p-2">{scenario.testSteps}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Expected Result</div>
                      <div className="text-sm text-gray-700">{scenario.expectedResult}</div>
                    </div>
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
