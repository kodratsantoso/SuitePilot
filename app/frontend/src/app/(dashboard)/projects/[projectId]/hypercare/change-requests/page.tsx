'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useChangeRequests, useCreateChangeRequest, useUpdateChangeRequest } from '@/hooks/useChangeRequests'
import { ChangeRequestStatusBadge } from '@/components/ai/ChangeRequestStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import type { ChangeRequestStatus, TaskPriority } from '@/types'

const STATUSES: ChangeRequestStatus[] = ['PROPOSED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED']
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
}

export default function ChangeRequestsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: changeRequests = [], isLoading, isError, refetch } = useChangeRequests(projectId)
  const createCR = useCreateChangeRequest(projectId)
  const updateCR = useUpdateChangeRequest(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ChangeRequestStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
  })

  const filtered = changeRequests.filter((cr) => {
    if (statusFilter && cr.status !== statusFilter) return false
    if (priorityFilter && cr.priority !== priorityFilter) return false
    return true
  })

  function resetForm() {
    setForm({ title: '', description: '', priority: 'MEDIUM' })
    setFormError('')
  }

  async function handleCreate() {
    if (!form.title.trim()) { setFormError('Title is required'); return }
    try {
      await createCR.mutateAsync({
        title: form.title.trim(),
        description: form.description || undefined,
        priority: form.priority,
      })
      setSheetOpen(false)
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create change request')
    }
  }

  async function handleStatusChange(changeId: string, status: ChangeRequestStatus) {
    await updateCR.mutateAsync({ changeId, data: { status } })
  }

  if (isLoading) return <LoadingState message="Loading change requests..." />
  if (isError) return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
      Failed to load change requests. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Requests"
        description="Manage post-go-live change requests and enhancement proposals"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>New Request</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ChangeRequestStatus | '')}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {(statusFilter || priorityFilter) && (
          <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => { setStatusFilter(''); setPriorityFilter('') }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Change request list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No change requests"
          description="Submit change requests for post-go-live modifications."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>New Request</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((cr) => (
            <div key={cr.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ChangeRequestStatusBadge status={cr.status} />
                    <span className={`text-xs font-semibold ${PRIORITY_COLORS[cr.priority]}`}>{cr.priority}</span>
                    {cr.requester && <span className="text-xs text-gray-400">by {cr.requester.name}</span>}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{cr.title}</div>
                  {cr.description && <div className="mt-1 text-xs text-gray-500 line-clamp-2">{cr.description}</div>}
                  {cr.resolvedAt && (
                    <div className="mt-1 text-xs text-green-600">Resolved {new Date(cr.resolvedAt).toLocaleDateString()}</div>
                  )}
                  <div className="mt-1 text-xs text-gray-400">Submitted {new Date(cr.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex-shrink-0">
                  <select
                    value={cr.status}
                    onChange={(e) => handleStatusChange(cr.id, e.target.value as ChangeRequestStatus)}
                    className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setSheetOpen(false); resetForm() }} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">New Change Request</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Change request title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Describe the requested change and business justification..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {formError && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setSheetOpen(false); resetForm() }}>Cancel</Button>
              <Button size="sm" loading={createCR.isPending} onClick={handleCreate}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
