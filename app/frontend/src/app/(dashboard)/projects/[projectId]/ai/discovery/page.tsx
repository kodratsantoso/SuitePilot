'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useDiscoverySessions,
  useCreateDiscoverySession,
  useDeleteDiscoverySession,
} from '@/hooks/useDiscoverySessions'
import type { DiscoverySessionStatus } from '@/types'
import { DiscoverySessionStatusBadge } from '@/components/ai/DiscoverySessionStatusBadge'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function DiscoverySessionsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | undefined>()
  const [formError, setFormError] = useState('')

  const params = statusFilter ? { status: statusFilter } : undefined
  const { data: sessions = [], isLoading, isError, refetch } = useDiscoverySessions(projectId, params)
  const createSession = useCreateDiscoverySession(projectId)
  const deleteSession = useDeleteDiscoverySession(projectId)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const form = e.currentTarget
    const fd = new FormData(form)
    const data: Record<string, unknown> = {
      title: fd.get('title') as string,
      description: fd.get('description') as string || undefined,
      status: (fd.get('status') as DiscoverySessionStatus) || 'DRAFT',
    }
    try {
      const res = await createSession.mutateAsync(data)
      setSheetOpen(false)
      router.push(`/projects/${projectId}/ai/discovery/${res.data.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create session')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteSession.mutateAsync(deleteTarget.id)
      setDeleteTarget(undefined)
    } catch { /* non-critical */ }
  }

  return (
    <div>
      <PageHeader
        title="Discovery Sessions"
        description={isLoading ? '' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
        action={<Button onClick={() => setSheetOpen(true)} size="sm">+ New Session</Button>}
      />

      {/* Status filter */}
      <div className="mt-4 flex flex-wrap gap-1">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition',
              statusFilter === value
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && sessions.length === 0 && (
          <EmptyState
            title={statusFilter ? 'No sessions match this filter' : 'No discovery sessions yet'}
            description={statusFilter ? 'Try a different status filter.' : 'Start a new discovery session to capture requirements and pain points.'}
            action={!statusFilter ? <Button onClick={() => setSheetOpen(true)} size="sm">Create first session</Button> : undefined}
          />
        )}
        {!isLoading && !isError && sessions.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group relative rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition cursor-pointer"
                onClick={() => router.push(`/projects/${projectId}/ai/discovery/${session.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{session.title}</h3>
                  <DiscoverySessionStatusBadge status={session.status} className="flex-shrink-0" />
                </div>
                {session.description && (
                  <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{session.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {session._count && (
                      <>
                        <span>{session._count.questions} questions</span>
                        <span>{session._count.requirements} requirements</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(session.createdAt)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget({ id: session.id, title: session.title })
                  }}
                  className="absolute right-2 top-2 rounded p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition"
                  title="Delete session"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setFormError('') }} title="New Discovery Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Title" required>
            <Input name="title" placeholder="e.g. Initial Discovery — Finance Module" required />
          </FormField>
          <FormField label="Description">
            <Textarea name="description" placeholder="Brief description of this session's focus..." rows={3} />
          </FormField>
          <FormField label="Initial Status">
            <Select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
            </Select>
          </FormField>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createSession.isPending}>
              Create Session
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Session"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
        loading={deleteSession.isPending}
      />
    </div>
  )
}
