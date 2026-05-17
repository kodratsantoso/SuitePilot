'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useHypercareTasks } from '@/hooks/useHypercareTasks'
import { useIssues } from '@/hooks/useIssues'
import { useGoLiveItems } from '@/hooks/useGoLive'
import { useChangeRequests } from '@/hooks/useChangeRequests'
import { usePostImplRisks, useCreatePostImplRisk, useUpdatePostImplRisk } from '@/hooks/usePostImplRisks'
import { SeverityBadge } from '@/components/ai/SeverityBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import type { Severity, PostImplRiskStatus } from '@/types'

const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const RISK_STATUSES: PostImplRiskStatus[] = ['OPEN', 'MONITORING', 'MITIGATED', 'CLOSED']

const RISK_STATUS_COLORS: Record<PostImplRiskStatus, string> = {
  OPEN:       'text-red-600 bg-red-50 border-red-200',
  MONITORING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  MITIGATED:  'text-green-600 bg-green-50 border-green-200',
  CLOSED:     'text-gray-500 bg-gray-50 border-gray-200',
}

export default function ReportsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: tasks = [], isLoading: tasksLoading } = useHypercareTasks(projectId)
  const { data: issues = [], isLoading: issuesLoading } = useIssues(projectId)
  const { data: goLiveItems = [], isLoading: goLiveLoading } = useGoLiveItems(projectId)
  const { data: changeRequests = [], isLoading: crLoading } = useChangeRequests(projectId)
  const { data: risks = [], isLoading: risksLoading } = usePostImplRisks(projectId)
  const createRisk = useCreatePostImplRisk(projectId)
  const updateRisk = useUpdatePostImplRisk(projectId)

  const isLoading = tasksLoading || issuesLoading || goLiveLoading || crLoading || risksLoading

  const [sheetOpen, setSheetOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    description: '',
    severity: 'MEDIUM' as Severity,
    mitigation: '',
  })

  function resetForm() {
    setForm({ description: '', severity: 'MEDIUM', mitigation: '' })
    setFormError('')
  }

  async function handleCreateRisk() {
    if (!form.description.trim()) { setFormError('Description is required'); return }
    try {
      await createRisk.mutateAsync({
        description: form.description.trim(),
        severity: form.severity,
        mitigation: form.mitigation || undefined,
      })
      setSheetOpen(false)
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add risk')
    }
  }

  async function handleRiskStatusChange(riskId: string, status: PostImplRiskStatus) {
    await updateRisk.mutateAsync({ riskId, data: { status } })
  }

  if (isLoading) return <LoadingState message="Loading reports..." />

  // Stats
  const taskDone = tasks.filter((t) => t.status === 'DONE').length
  const openIssues = issues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length
  const goLiveCompleted = goLiveItems.filter((g) => g.status === 'COMPLETED').length
  const goLiveNa = goLiveItems.filter((g) => g.status === 'NOT_APPLICABLE').length
  const goLivePct = Math.round((goLiveCompleted / Math.max(goLiveItems.length - goLiveNa, 1)) * 100)
  const pendingCRs = changeRequests.filter((c) => c.status === 'PROPOSED' || c.status === 'IN_REVIEW').length
  const openRisks = risks.filter((r) => r.status === 'OPEN' || r.status === 'MONITORING').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports &amp; Risks"
        description="Post-implementation summary, risk register, and AI report generation"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Risk</Button>}
      />

      {/* Summary stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Post-Implementation Summary</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{taskDone}/{tasks.length}</div>
            <div className="mt-0.5 text-xs text-gray-500">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${openIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>{openIssues}</div>
            <div className="mt-0.5 text-xs text-gray-500">Open Issues</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${goLivePct === 100 ? 'text-green-600' : 'text-yellow-600'}`}>{goLivePct}%</div>
            <div className="mt-0.5 text-xs text-gray-500">Go-Live Ready</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${pendingCRs > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{pendingCRs}</div>
            <div className="mt-0.5 text-xs text-gray-500">Pending CRs</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${openRisks > 0 ? 'text-red-600' : 'text-green-600'}`}>{openRisks}</div>
            <div className="mt-0.5 text-xs text-gray-500">Active Risks</div>
          </div>
        </div>
      </div>

      {/* AI Reports - Coming Soon */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M10 2C7.239 2 5 4.015 5 6.5c0 1.38.633 2.614 1.636 3.456L6.5 12h7l-.136-2.044A4.496 4.496 0 0015 6.5C15 4.015 12.761 2 10 2z" />
              <path strokeLinecap="round" d="M8 12v1.5a2 2 0 004 0V12" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI-Generated Hypercare Reports</h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Automated post-implementation health reports, issue trend analysis, and hypercare completion summaries generated by AI are coming soon. Reports will synthesize data from all hypercare modules into executive-ready documents.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
              Coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Risk Register */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Post-Implementation Risk Register</h2>
          <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)}>Add Risk</Button>
        </div>

        {risks.length === 0 ? (
          <EmptyState
            title="No risks logged"
            description="Document post-implementation risks and mitigation plans."
            action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Risk</Button>}
          />
        ) : (
          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={risk.severity} />
                      <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${RISK_STATUS_COLORS[risk.status]}`}>
                        {risk.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">{risk.description}</div>
                    {risk.mitigation && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Mitigation:</span> {risk.mitigation}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">{new Date(risk.createdAt).toLocaleDateString()}</div>
                  </div>
                  <select
                    value={risk.status}
                    onChange={(e) => handleRiskStatusChange(risk.id, e.target.value as PostImplRiskStatus)}
                    className="flex-shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {RISK_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Risk Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setSheetOpen(false); resetForm() }} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Risk</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Describe the risk..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as Severity }))}
                >
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitigation Plan</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="How will this risk be mitigated? (optional)"
                  value={form.mitigation}
                  onChange={(e) => setForm((f) => ({ ...f, mitigation: e.target.value }))}
                />
              </div>
              {formError && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setSheetOpen(false); resetForm() }}>Cancel</Button>
              <Button size="sm" loading={createRisk.isPending} onClick={handleCreateRisk}>Add Risk</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
