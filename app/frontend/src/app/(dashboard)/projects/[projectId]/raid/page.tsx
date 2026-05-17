'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRaidItems, useCreateRaidItem, useUpdateRaidItem, useDeleteRaidItem } from '@/hooks/useRaid'
import type { RaidItem } from '@/types'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { RaidForm } from '@/components/raid/RaidForm'
import { RaidTypeBadge, RaidStatusBadge } from '@/components/raid/RaidTypeBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { cn } from '@/lib/utils'

const TYPE_FILTERS = ['', 'RISK', 'ASSUMPTION', 'ISSUE', 'DEPENDENCY', 'DECISION']
const STATUS_FILTERS = ['', 'OPEN', 'MONITORING', 'ESCALATED', 'MITIGATED', 'RESOLVED', 'CLOSED']

export default function RaidLogPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RaidItem | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<RaidItem | undefined>()
  const [formError, setFormError] = useState('')

  const params: Record<string, string> = {}
  if (typeFilter) params['type'] = typeFilter
  if (statusFilter) params['status'] = statusFilter

  const { data: allItems = [], isLoading, isError, refetch } = useRaidItems(projectId, Object.keys(params).length ? params : undefined)
  const createItem = useCreateRaidItem(projectId)
  const updateItem = useUpdateRaidItem(projectId)
  const deleteItem = useDeleteRaidItem(projectId)

  const items = search
    ? allItems.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
    : allItems

  function openCreate() { setEditingItem(undefined); setFormError(''); setSheetOpen(true) }
  function openEdit(item: RaidItem) { setEditingItem(item); setFormError(''); setSheetOpen(true) }
  function closeSheet() { setSheetOpen(false); setEditingItem(undefined) }

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ raidId: editingItem.id, data })
      } else {
        await createItem.mutateAsync(data)
      }
      closeSheet()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save item')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteItem.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
  }

  const openCount = allItems.filter((i) => ['OPEN', 'ESCALATED', 'MONITORING'].includes(i.status)).length

  return (
    <div>
      <PageHeader
        title="RAID Log"
        description={isLoading ? '' : `${items.length} item${items.length !== 1 ? 's' : ''} · ${openCount} open`}
        action={<Button onClick={openCreate} size="sm">+ New Item</Button>}
      />

      {/* Filters */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                typeFilter === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {t || 'All Types'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {STATUS_FILTERS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium transition',
                  statusFilter === s ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {s || 'All Statuses'}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="mt-4">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            title={typeFilter || statusFilter || search ? 'No items match your filters' : 'No RAID items yet'}
            description={typeFilter || statusFilter || search
              ? 'Try adjusting your filters.'
              : 'RAID tracks Risks, Assumptions, Issues, Dependencies, and Decisions. Start logging.'}
            action={!typeFilter && !statusFilter && !search ? <Button onClick={openCreate} size="sm">Log first item</Button> : undefined}
          />
        )}
        {!isLoading && !isError && items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RaidTypeBadge type={item.type} />
                      <RaidStatusBadge status={item.status} />
                      {item.severity && (
                        <span className="text-xs text-gray-400">Severity: {item.severity}</span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                    {item.mitigation && (
                      <p className="mt-1 text-xs text-gray-500">
                        <span className="font-medium">Mitigation:</span> {item.mitigation}
                      </p>
                    )}
                    {item.owner && <p className="mt-1 text-xs text-gray-400">Owner: {item.owner.name}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" d="M11 2l3 3-8 8H3v-3L11 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={closeSheet} title={editingItem ? 'Edit RAID Item' : 'New RAID Item'} size="lg">
        <RaidForm
          item={editingItem}
          onSubmit={handleSubmit}
          onCancel={closeSheet}
          loading={createItem.isPending || updateItem.isPending}
          error={formError}
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete RAID Item"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
        loading={deleteItem.isPending}
      />
    </div>
  )
}
