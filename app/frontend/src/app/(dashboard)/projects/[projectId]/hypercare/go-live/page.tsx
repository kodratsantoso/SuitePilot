'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useGoLiveItems, useBulkCreateGoLiveItems, useUpdateGoLiveItem } from '@/hooks/useGoLive'
import { GoLiveStatusBadge } from '@/components/ai/GoLiveStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import type { GoLiveStatus } from '@/types'

const FILTERS: { value: GoLiveStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'NOT_APPLICABLE', label: 'N/A' },
]

export default function GoLivePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: items = [], isLoading, isError, refetch } = useGoLiveItems(projectId)
  const bulkCreate = useBulkCreateGoLiveItems(projectId)
  const updateItem = useUpdateGoLiveItem(projectId)

  const [statusFilter, setStatusFilter] = useState<GoLiveStatus | ''>('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkError, setBulkError] = useState('')
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})

  const filtered = statusFilter ? items.filter((i) => i.status === statusFilter) : items

  // Progress calculation
  const completed = items.filter((i) => i.status === 'COMPLETED').length
  const notApplicable = items.filter((i) => i.status === 'NOT_APPLICABLE').length
  const total = items.length
  const pct = Math.round((completed / Math.max(total - notApplicable, 1)) * 100)

  async function handleToggle(itemId: string, current: GoLiveStatus) {
    const next: GoLiveStatus = current === 'PENDING' ? 'COMPLETED' : current === 'COMPLETED' ? 'PENDING' : current
    if (next !== current) {
      await updateItem.mutateAsync({ itemId, data: { status: next } })
    }
  }

  async function handleStatusChange(itemId: string, status: GoLiveStatus) {
    await updateItem.mutateAsync({ itemId, data: { status } })
  }

  async function handleNotesSave(itemId: string) {
    const notes = editingNotes[itemId] ?? ''
    await updateItem.mutateAsync({ itemId, data: { notes } })
    setEditingNotes((prev) => { const n = { ...prev }; delete n[itemId]; return n })
  }

  async function handleBulkAdd() {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) { setBulkError('Enter at least one item'); return }
    try {
      await bulkCreate.mutateAsync(lines.map((l) => ({ checklistItem: l })))
      setBulkOpen(false)
      setBulkText('')
      setBulkError('')
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : 'Failed to add items')
    }
  }

  if (isLoading) return <LoadingState message="Loading go-live checklist..." />
  if (isError) return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
      Failed to load checklist. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Go-Live Readiness"
        description="Track readiness criteria before and after go-live"
        action={<Button size="sm" onClick={() => setBulkOpen(true)}>Add Items</Button>}
      />

      {/* Progress bar */}
      {total > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Readiness</span>
            <span className={`text-lg font-bold ${pct === 100 ? 'text-green-600' : pct >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct >= 75 ? 'bg-yellow-400' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-gray-400">
            <span>{completed} completed</span>
            <span>{items.filter((i) => i.status === 'PENDING').length} pending</span>
            <span>{items.filter((i) => i.status === 'BLOCKED').length} blocked</span>
            {notApplicable > 0 && <span>{notApplicable} N/A</span>}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
            {f.value === '' ? ` (${total})` : ` (${items.filter((i) => i.status === f.value).length})`}
          </button>
        ))}
      </div>

      {/* Checklist */}
      {filtered.length === 0 ? (
        <EmptyState
          title={total === 0 ? 'No checklist items yet' : 'No items match the filter'}
          description={total === 0 ? 'Add go-live readiness criteria to track your readiness.' : 'Try selecting a different filter.'}
          action={total === 0 ? <Button size="sm" onClick={() => setBulkOpen(true)}>Add Items</Button> : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const isEditingNotes = item.id in editingNotes
            return (
              <div key={item.id} className={`rounded-lg border bg-white p-4 ${item.status === 'BLOCKED' ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  {/* Checkbox toggle */}
                  <button
                    onClick={() => handleToggle(item.id, item.status)}
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      item.status === 'COMPLETED'
                        ? 'border-green-500 bg-green-500 text-white'
                        : item.status === 'NOT_APPLICABLE'
                        ? 'cursor-default border-gray-200 bg-gray-100'
                        : 'border-gray-300 hover:border-brand-400'
                    }`}
                    disabled={item.status === 'NOT_APPLICABLE'}
                    title={item.status === 'NOT_APPLICABLE' ? 'N/A' : item.status === 'COMPLETED' ? 'Mark pending' : 'Mark complete'}
                  >
                    {item.status === 'COMPLETED' && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.checklistItem}
                      </span>
                      <GoLiveStatusBadge status={item.status} />
                    </div>

                    {/* Notes */}
                    {isEditingNotes ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                          value={editingNotes[item.id]}
                          onChange={(e) => setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Add notes..."
                          autoFocus
                        />
                        <button
                          onClick={() => handleNotesSave(item.id)}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotes((prev) => { const n = { ...prev }; delete n[item.id]; return n })}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        {item.notes && <span className="text-xs text-gray-400">{item.notes}</span>}
                        <button
                          onClick={() => setEditingNotes((prev) => ({ ...prev, [item.id]: item.notes ?? '' }))}
                          className="text-xs text-gray-300 hover:text-gray-500"
                        >
                          {item.notes ? 'Edit note' : 'Add note'}
                        </button>
                      </div>
                    )}
                  </div>

                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as GoLiveStatus)}
                    className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 flex-shrink-0"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="NOT_APPLICABLE">N/A</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bulk add dialog */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setBulkOpen(false); setBulkText(''); setBulkError('') }} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Add Checklist Items</h3>
            <p className="mt-1 text-xs text-gray-500">Enter one item per line. Each line becomes a separate checklist item.</p>
            <textarea
              rows={8}
              className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={'Data migration validated\nUser training completed\nSystem access provisioned\nBackup verified'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            {bulkError && <div className="mt-2 text-xs text-red-600">{bulkError}</div>}
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setBulkOpen(false); setBulkText(''); setBulkError('') }}>Cancel</Button>
              <Button size="sm" loading={bulkCreate.isPending} onClick={handleBulkAdd}>Add Items</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
