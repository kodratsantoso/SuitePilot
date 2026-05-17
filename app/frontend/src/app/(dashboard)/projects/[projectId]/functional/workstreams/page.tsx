'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useWorkstreams, useCreateWorkstream, useUpdateWorkstream } from '@/hooks/useWorkstreams'
import type { FunctionalWorkstream } from '@/types'
import { WorkstreamStatusBadge } from '@/components/ai/WorkstreamStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

const STATUS_OPTIONS = ['PLANNED', 'ACTIVE', 'BLOCKED', 'COMPLETED', 'ON_HOLD'] as const

function WorkstreamForm({
  initial,
  onSubmit,
  onCancel,
  error,
}: {
  initial?: Partial<FunctionalWorkstream>
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  error?: string
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'PLANNED')
  const [progress, setProgress] = useState(String(initial?.progressPercentage ?? 0))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, description: description || undefined, status, progressPercentage: parseInt(progress) })
      }}
      className="space-y-4 p-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Finance Workstream"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Workstream scope and objectives..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      {initial && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Progress ({progress}%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm">{initial?.id ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default function WorkstreamsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: workstreams = [], isLoading, isError, refetch } = useWorkstreams(projectId)
  const createWorkstream = useCreateWorkstream(projectId)
  const updateWorkstream = useUpdateWorkstream(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<FunctionalWorkstream | undefined>()
  const [formError, setFormError] = useState('')

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      if (editing) {
        await updateWorkstream.mutateAsync({ workstreamId: editing.id, data })
      } else {
        await createWorkstream.mutateAsync(data)
      }
      setSheetOpen(false)
      setEditing(undefined)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  if (isLoading) return <LoadingState message="Loading workstreams..." />
  if (isError) return <div className="text-red-600 text-sm">Failed to load workstreams. <button onClick={() => refetch()} className="underline">Retry</button></div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Functional Workstreams"
        description="Manage implementation workstreams and track delivery progress"
        action={<Button size="sm" onClick={() => { setEditing(undefined); setSheetOpen(true) }}>+ Add Workstream</Button>}
      />

      {workstreams.length === 0 ? (
        <EmptyState
          title="No workstreams yet"
          description="Create workstreams to organise your functional delivery by business area."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Workstream</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workstreams.map((ws) => (
            <div key={ws.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{ws.name}</div>
                  {ws.owner && <div className="text-xs text-gray-400 mt-0.5">Owner: {ws.owner.name}</div>}
                </div>
                <WorkstreamStatusBadge status={ws.status} />
              </div>
              {ws.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ws.description}</p>}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{ws.progressPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${ws.progressPercentage}%` }} />
                </div>
              </div>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{ws._count?.businessProcesses ?? 0} processes</span>
                <span>{ws._count?.uatScenarios ?? 0} UAT</span>
                <span>{ws._count?.sopDocuments ?? 0} SOPs</span>
              </div>
              <button
                onClick={() => { setEditing(ws); setSheetOpen(true) }}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditing(undefined) }} title={editing ? 'Edit Workstream' : 'New Workstream'}>
        <WorkstreamForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setSheetOpen(false); setEditing(undefined) }}
          error={formError}
        />
      </Sheet>
    </div>
  )
}
