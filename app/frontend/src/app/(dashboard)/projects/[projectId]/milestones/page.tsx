'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '@/hooks/useMilestones'
import type { ProjectMilestone } from '@/types'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { MilestoneForm } from '@/components/milestones/MilestoneForm'
import { MilestoneStatusBadge } from '@/components/milestones/MilestoneStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function MilestonesPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectMilestone | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ProjectMilestone | undefined>()
  const [formError, setFormError] = useState('')

  const { data: milestones = [], isLoading, isError, refetch } = useMilestones(projectId)
  const createMilestone = useCreateMilestone(projectId)
  const updateMilestone = useUpdateMilestone(projectId)
  const deleteMilestone = useDeleteMilestone(projectId)

  function openCreate() { setEditingItem(undefined); setFormError(''); setSheetOpen(true) }
  function openEdit(ms: ProjectMilestone) { setEditingItem(ms); setFormError(''); setSheetOpen(true) }
  function closeSheet() { setSheetOpen(false); setEditingItem(undefined) }

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      if (editingItem) {
        await updateMilestone.mutateAsync({ milestoneId: editingItem.id, data })
      } else {
        await createMilestone.mutateAsync(data)
      }
      closeSheet()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save milestone')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteMilestone.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  const overallProgress = milestones.length
    ? Math.round(milestones.reduce((s, m) => s + m.completionPercentage, 0) / milestones.length)
    : 0

  return (
    <div>
      <PageHeader
        title="Milestones"
        description={isLoading ? '' : `${milestones.length} milestone${milestones.length !== 1 ? 's' : ''} · Overall progress ${overallProgress}%`}
        action={<Button onClick={openCreate} size="sm">+ New Milestone</Button>}
      />

      <div className="mt-4">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && milestones.length === 0 && (
          <EmptyState
            title="No milestones yet"
            description="Milestones track the key delivery checkpoints for this project."
            action={<Button onClick={openCreate} size="sm">Create first milestone</Button>}
          />
        )}
        {!isLoading && !isError && milestones.length > 0 && (
          <div className="space-y-3">
            {milestones.map((ms) => (
              <div key={ms.id} className="group rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <MilestoneStatusBadge status={ms.status} />
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-gray-900">{ms.name}</h3>
                    {ms.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{ms.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>Target: {formatDate(ms.targetDate)}</span>
                      {ms.actualDate && <span className="text-green-600">Completed: {formatDate(ms.actualDate)}</span>}
                      {ms.owner && <span>Owner: {ms.owner.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      onClick={() => openEdit(ms)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" d="M11 2l3 3-8 8H3v-3L11 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ms)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5" />
                      </svg>
                    </button>
                  </div>
                </div>
                {ms.status !== 'COMPLETED' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{ms.completionPercentage}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          ms.status === 'AT_RISK' || ms.status === 'DELAYED' ? 'bg-orange-400' : 'bg-brand-500'
                        )}
                        style={{ width: `${ms.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={closeSheet} title={editingItem ? 'Edit Milestone' : 'New Milestone'}>
        <MilestoneForm
          milestone={editingItem}
          onSubmit={handleSubmit}
          onCancel={closeSheet}
          loading={createMilestone.isPending || updateMilestone.isPending}
          error={formError}
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Milestone"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
        loading={deleteMilestone.isPending}
      />
    </div>
  )
}
