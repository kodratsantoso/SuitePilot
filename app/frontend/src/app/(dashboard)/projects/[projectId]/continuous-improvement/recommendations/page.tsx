'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  useRecommendations,
  useCreateRecommendation,
  useUpdateRecommendation,
} from '@/hooks/useContinuousImprovement'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import type { RecommendationType, RecommendationStatus } from '@/types'

const REC_TYPES: RecommendationType[] = ['PROCESS', 'AI_MODEL', 'WORKFLOW', 'RISK_MITIGATION']
const STATUSES: RecommendationStatus[] = ['DRAFT', 'REVIEWED', 'APPROVED', 'IMPLEMENTED', 'REJECTED']

const TYPE_LABELS: Record<RecommendationType, string> = {
  PROCESS: 'Process',
  AI_MODEL: 'AI Model',
  WORKFLOW: 'Workflow',
  RISK_MITIGATION: 'Risk Mitigation',
}

const STATUS_COLORS: Record<RecommendationStatus, string> = {
  DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
  REVIEWED: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  APPROVED: 'text-green-700 bg-green-50 border-green-200',
  IMPLEMENTED: 'text-blue-700 bg-blue-50 border-blue-200',
  REJECTED: 'text-red-700 bg-red-50 border-red-200',
}

type CreateFormState = {
  recommendationType: RecommendationType
  description: string
  confidenceScore: string
  impactScore: string
}

const EMPTY_FORM: CreateFormState = {
  recommendationType: 'PROCESS',
  description: '',
  confidenceScore: '',
  impactScore: '',
}

export default function RecommendationsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const [typeFilter, setTypeFilter] = useState<RecommendationType | ''>('')
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | ''>('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const params: Record<string, string> = {}
  if (typeFilter) params.recommendationType = typeFilter
  if (statusFilter) params.status = statusFilter

  const { data: items = [], isLoading } = useRecommendations(projectId, params)
  const createRec = useCreateRecommendation(projectId)
  const updateRec = useUpdateRecommendation(projectId)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.description.trim()) { setFormError('Description is required'); return }
    try {
      await createRec.mutateAsync({
        recommendationType: form.recommendationType,
        description: form.description.trim(),
        ...(form.confidenceScore && { confidenceScore: Number(form.confidenceScore) }),
        ...(form.impactScore && { impactScore: Number(form.impactScore) }),
      })
      setSheetOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create recommendation')
    }
  }

  async function handleStatusChange(id: string, status: RecommendationStatus) {
    setUpdatingId(id)
    try {
      await updateRec.mutateAsync({ id, data: { status } })
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) return <LoadingState />

  const typeCounts = REC_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = items.filter(r => r.recommendationType === t).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader
        title="Optimization Recommendations"
        description="Review and approve AI-generated optimization recommendations for future projects."
        action={<Button onClick={() => setSheetOpen(true)}>+ New Recommendation</Button>}
      />

      {/* Type Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REC_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              typeFilter === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xl font-bold text-gray-900">{typeCounts[t] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[t]}</div>
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
            {s}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {items.length === 0 ? (
        <EmptyState
          title="No recommendations found"
          description={typeFilter || statusFilter ? 'Try adjusting the filters.' : 'Create the first optimization recommendation.'}
        />
      ) : (
        <div className="space-y-3">
          {items.map(rec => (
            <div key={rec.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {TYPE_LABELS[rec.recommendationType]}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_COLORS[rec.status]}`}>
                      {rec.status}
                    </span>
                    {rec.impactScore != null && (
                      <span className="text-xs text-gray-500">Impact: <strong>{Math.round(rec.impactScore)}/100</strong></span>
                    )}
                    {rec.confidenceScore != null && (
                      <span className="text-xs text-gray-500">Confidence: <strong>{Math.round(rec.confidenceScore)}%</strong></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{rec.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    By {rec.createdByUser?.name ?? '—'} · {new Date(rec.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Quick status transitions */}
                {rec.status === 'DRAFT' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      disabled={updatingId === rec.id}
                      onClick={() => handleStatusChange(rec.id, 'REVIEWED')}
                    >
                      Mark Reviewed
                    </Button>
                  </div>
                )}
                {rec.status === 'REVIEWED' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      disabled={updatingId === rec.id}
                      onClick={() => handleStatusChange(rec.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      disabled={updatingId === rec.id}
                      onClick={() => handleStatusChange(rec.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  </div>
                )}
                {rec.status === 'APPROVED' && (
                  <Button
                    disabled={updatingId === rec.id}
                    onClick={() => handleStatusChange(rec.id, 'IMPLEMENTED')}
                  >
                    Mark Implemented
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setForm(EMPTY_FORM); setFormError('') }}
        title="New Recommendation"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{formError}</div>
          )}

          <FormField label="Recommendation Type" required>
            <select
              value={form.recommendationType}
              onChange={e => setForm(f => ({ ...f, recommendationType: e.target.value as RecommendationType }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REC_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Impact Score (0–100)">
            <Input
              type="number"
              min="0"
              max="100"
              value={form.impactScore}
              onChange={e => setForm(f => ({ ...f, impactScore: e.target.value }))}
              placeholder="e.g. 80"
            />
          </FormField>

          <FormField label="Confidence Score (0–100)">
            <Input
              type="number"
              min="0"
              max="100"
              value={form.confidenceScore}
              onChange={e => setForm(f => ({ ...f, confidenceScore: e.target.value }))}
              placeholder="e.g. 75"
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              placeholder="Describe the optimization recommendation..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setSheetOpen(false); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRec.isPending}>
              {createRec.isPending ? 'Creating…' : 'Create Recommendation'}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
