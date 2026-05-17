'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTechnicalDeliverables, useCreateTechnicalDeliverable } from '@/hooks/useTechnicalDeliverables'
import { useTechnicalWorkstreams } from '@/hooks/useTechnicalWorkstreams'
import { TechnicalStatusBadge } from '@/components/ai/TechnicalStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import type { TechnicalDeliverableType, TechnicalStatus } from '@/types'

const DELIVERABLE_TYPES: TechnicalDeliverableType[] = [
  'INTEGRATION_MAPPING', 'RESTLET_DESIGN', 'API_CONTRACT',
  'PAYLOAD_VALIDATION', 'DATA_MIGRATION_PLAN', 'SECURITY_PLAN',
]

const TYPE_LABELS: Record<TechnicalDeliverableType, string> = {
  INTEGRATION_MAPPING: 'Integration Mapping',
  RESTLET_DESIGN: 'RESTlet Design',
  API_CONTRACT: 'API Contract',
  PAYLOAD_VALIDATION: 'Payload Validation',
  DATA_MIGRATION_PLAN: 'Data Migration Plan',
  SECURITY_PLAN: 'Security Plan',
}

const STATUSES: TechnicalStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED']

type FormState = {
  title: string
  deliverableType: TechnicalDeliverableType
  description: string
  workstreamId: string
  status: TechnicalStatus
}

const EMPTY_FORM: FormState = {
  title: '',
  deliverableType: 'INTEGRATION_MAPPING',
  description: '',
  workstreamId: '',
  status: 'DRAFT',
}

export default function TechnicalDeliverablesPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const [typeFilter, setTypeFilter] = useState<TechnicalDeliverableType | ''>('')
  const [statusFilter, setStatusFilter] = useState<TechnicalStatus | ''>('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const params: Record<string, string> = {}
  if (typeFilter) params.deliverableType = typeFilter
  if (statusFilter) params.status = statusFilter

  const { data: deliverables = [], isLoading } = useTechnicalDeliverables(projectId, params)
  const { data: workstreams = [] } = useTechnicalWorkstreams(projectId)
  const createDeliverable = useCreateTechnicalDeliverable(projectId)

  const typeCounts = DELIVERABLE_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = deliverables.filter(d => d.deliverableType === t).length
    return acc
  }, {})

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim()) { setFormError('Title is required'); return }
    try {
      await createDeliverable.mutateAsync({
        title: form.title.trim(),
        deliverableType: form.deliverableType,
        description: form.description.trim() || undefined,
        workstreamId: form.workstreamId || undefined,
        status: form.status,
      })
      setSheetOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create deliverable')
    }
  }

  if (isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Deliverables"
        description="Track all technical deliverables across integrations, RESTlets, API contracts, and more."
        action={<Button onClick={() => setSheetOpen(true)}>+ New Deliverable</Button>}
      />

      {/* Type Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {DELIVERABLE_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              typeFilter === t
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xl font-bold text-gray-900">{typeCounts[t] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{TYPE_LABELS[t]}</div>
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !statusFilter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          All
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Deliverable List */}
      {deliverables.length === 0 ? (
        <EmptyState
          title="No deliverables found"
          description={typeFilter || statusFilter ? 'Try adjusting the filters.' : 'Create your first technical deliverable to get started.'}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Workstream</th>
                <th className="px-4 py-3 text-right">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliverables.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{d.title}</div>
                    {d.description && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{d.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {TYPE_LABELS[d.deliverableType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TechnicalStatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {d.workstreamId
                      ? workstreams.find(w => w.id === d.workstreamId)?.name ?? '—'
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">v{d.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setForm(EMPTY_FORM); setFormError('') }} title="New Technical Deliverable">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{formError}</div>
          )}

          <FormField label="Title" required>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. NetSuite ↔ Salesforce Integration"
            />
          </FormField>

          <FormField label="Deliverable Type" required>
            <select
              value={form.deliverableType}
              onChange={e => setForm(f => ({ ...f, deliverableType: e.target.value as TechnicalDeliverableType }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DELIVERABLE_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Status">
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as TechnicalStatus }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </FormField>

          {workstreams.length > 0 && (
            <FormField label="Workstream">
              <select
                value={form.workstreamId}
                onChange={e => setForm(f => ({ ...f, workstreamId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— None —</option>
                {workstreams.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Optional description..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setSheetOpen(false); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDeliverable.isPending}>
              {createDeliverable.isPending ? 'Creating…' : 'Create Deliverable'}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
