'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useIssues, useCreateIssue, useUpdateIssue, useDeleteIssue } from '@/hooks/useIssues'
import { IssueStatusBadge } from '@/components/ai/IssueStatusBadge'
import { SeverityBadge } from '@/components/ai/SeverityBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import type { IssueStatus, Severity } from '@/types'

const STATUSES: IssueStatus[] = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED']
const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function IssuesPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: issues = [], isLoading, isError, refetch } = useIssues(projectId)
  const createIssue = useCreateIssue(projectId)
  const updateIssue = useUpdateIssue(projectId)
  const deleteIssue = useDeleteIssue(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('')
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM' as Severity,
    status: 'OPEN' as IssueStatus,
    assignedTo: '',
  })

  const filtered = issues.filter((i) => {
    if (statusFilter && i.status !== statusFilter) return false
    if (severityFilter && i.severity !== severityFilter) return false
    return true
  })

  // Stats
  const openCount = issues.filter((i) => i.status === 'OPEN').length
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length
  const escalatedCount = issues.filter((i) => i.status === 'ESCALATED').length
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length

  function resetForm() {
    setForm({ title: '', description: '', severity: 'MEDIUM', status: 'OPEN', assignedTo: '' })
    setFormError('')
  }

  async function handleCreate() {
    if (!form.title.trim()) { setFormError('Title is required'); return }
    try {
      await createIssue.mutateAsync({
        title: form.title.trim(),
        description: form.description || undefined,
        severity: form.severity,
        status: form.status,
        assignedTo: form.assignedTo || undefined,
      })
      setSheetOpen(false)
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to report issue')
    }
  }

  async function handleStatusChange(issueId: string, status: IssueStatus) {
    await updateIssue.mutateAsync({ issueId, data: { status } })
  }

  async function handleDelete(issueId: string) {
    await deleteIssue.mutateAsync(issueId)
    setDeleteId(null)
  }

  if (isLoading) return <LoadingState message="Loading issues..." />
  if (isError) return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
      Failed to load issues. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issues"
        description="Track and resolve post-go-live production issues"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>Report Issue</Button>}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Open', count: openCount, color: 'text-red-600' },
          { label: 'In Progress', count: inProgressCount, color: 'text-yellow-600' },
          { label: 'Escalated', count: escalatedCount, color: 'text-orange-600' },
          { label: 'Resolved', count: resolvedCount, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="mt-0.5 text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as Severity | '')}
        >
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(statusFilter || severityFilter) && (
          <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => { setStatusFilter(''); setSeverityFilter('') }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Issue list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No issues found"
          description="Report issues to track and resolve post-go-live problems."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Report Issue</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const isHighPriority = issue.severity === 'CRITICAL' || issue.status === 'ESCALATED'
            return (
              <div
                key={issue.id}
                className={`rounded-lg border bg-white p-4 ${isHighPriority ? 'border-l-4 border-red-400 border-l-red-500' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={issue.severity} />
                      <IssueStatusBadge status={issue.status} />
                      {issue.assignee && <span className="text-xs text-gray-400">{issue.assignee.name}</span>}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{issue.title}</div>
                    {issue.description && <div className="mt-1 text-xs text-gray-500 line-clamp-2">{issue.description}</div>}
                    {issue.resolvedAt && (
                      <div className="mt-1 text-xs text-green-600">Resolved {new Date(issue.resolvedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                      className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <button
                      onClick={() => setDeleteId(issue.id)}
                      className="text-xs text-gray-300 hover:text-red-500"
                      title="Delete issue"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" d="M3 4h10M6 4V3h4v1M5 4v8h6V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setSheetOpen(false); resetForm() }} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Report Issue</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Issue title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Describe the issue..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as IssueStatus }))}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Assignee name or ID (optional)"
                  value={form.assignedTo}
                  onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                />
              </div>
              {formError && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setSheetOpen(false); resetForm() }}>Cancel</Button>
              <Button size="sm" loading={createIssue.isPending} onClick={handleCreate}>Report Issue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Delete Issue</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this issue? This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" size="sm" loading={deleteIssue.isPending} onClick={() => handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
