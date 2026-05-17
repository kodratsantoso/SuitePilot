'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useReviewGates, useCreateReviewGate, useUpdateReviewGate } from '@/hooks/useGovernance'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { FormField } from '@/components/ui/FormField'
import { Input, Select } from '@/components/ui/Input'
import type { ReviewGateStage, ReviewGateStatusEnum } from '@/types'

const STAGE_STYLES: Record<ReviewGateStage, { bg: string; text: string; border: string; label: string }> = {
  AI_SELF_VALIDATION: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'AI Self-Validation' },
  PEER_REVIEW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Peer Review' },
  HUMAN_REVIEW: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Human Review' },
  GOVERNANCE_APPROVAL: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Governance Approval' },
}

const STATUS_STYLES: Record<ReviewGateStatusEnum, { bg: string; text: string; border: string; label: string }> = {
  PENDING: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Pending' },
  PASSED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Passed' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
  REVISION_REQUESTED: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Revision Requested' },
}

function StageBadge({ stage }: { stage: ReviewGateStage }) {
  const s = STAGE_STYLES[stage]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${s.bg} ${s.border} ${s.text}`}>
      {s.label}
    </span>
  )
}

function StatusBadge({ status }: { status: ReviewGateStatusEnum }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${s.bg} ${s.border} ${s.text}`}>
      {s.label}
    </span>
  )
}

const STAGES: ReviewGateStage[] = ['AI_SELF_VALIDATION', 'PEER_REVIEW', 'HUMAN_REVIEW', 'GOVERNANCE_APPROVAL']
const STATUSES: ReviewGateStatusEnum[] = ['PENDING', 'PASSED', 'REJECTED', 'REVISION_REQUESTED']

interface CreateForm {
  aiGeneratedOutputId: string
  stage: ReviewGateStage
  notes: string
}

export default function ReviewGatesPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const [filterStage, setFilterStage] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<CreateForm>({
    aiGeneratedOutputId: '',
    stage: 'AI_SELF_VALIDATION',
    notes: '',
  })

  const params: Record<string, string> = {}
  if (filterStage) params.stage = filterStage
  if (filterStatus) params.status = filterStatus

  const { data: gates = [], isLoading } = useReviewGates(projectId, Object.keys(params).length > 0 ? params : undefined)
  const createGate = useCreateReviewGate(projectId)
  const updateGate = useUpdateReviewGate(projectId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.aiGeneratedOutputId.trim()) return
    await createGate.mutateAsync({
      aiGeneratedOutputId: form.aiGeneratedOutputId.trim(),
      stage: form.stage,
      notes: form.notes || undefined,
    })
    setSheetOpen(false)
    setForm({ aiGeneratedOutputId: '', stage: 'AI_SELF_VALIDATION', notes: '' })
  }

  async function handleAction(gateId: string, status: ReviewGateStatusEnum) {
    await updateGate.mutateAsync({ gateId, data: { status, notes: '' } })
  }

  if (isLoading) return <LoadingState message="Loading review gates..." />

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Review Gates"
          description="Track AI self-validation, peer review, human review, and governance approval stages."
        />
        <Button onClick={() => setSheetOpen(true)}>Add Gate</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="w-52"
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{STAGE_STYLES[s].label}</option>
          ))}
        </Select>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-44"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
          ))}
        </Select>
      </div>

      {/* List */}
      {gates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M8 2l1.5 3h3l-2.5 2 1 3L8 8.5 5 10l1-3L3.5 5h3z" />
              <circle cx="8" cy="13" r="1" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No review gates yet</p>
          <p className="mt-1 text-xs text-gray-400">Add a review gate to track the approval lifecycle of AI outputs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gates.map((gate) => (
            <div key={gate.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {gate.output && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">{gate.output.title}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {gate.output.outputType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <StageBadge stage={gate.stage} />
                    <StatusBadge status={gate.status} />
                  </div>
                  {gate.reviewer && (
                    <p className="mt-1.5 text-xs text-gray-500">Reviewer: {gate.reviewer.name}</p>
                  )}
                  {gate.notes && (
                    <p className="mt-1 text-xs text-gray-400 italic">{gate.notes}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs text-gray-400 block">
                    {new Date(gate.createdAt).toLocaleDateString()}
                  </span>
                  {gate.status === 'PENDING' && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => handleAction(gate.id, 'PASSED')}
                        disabled={updateGate.isPending}
                      >
                        Pass
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-orange-700 border-orange-200 hover:bg-orange-50"
                        onClick={() => handleAction(gate.id, 'REVISION_REQUESTED')}
                        disabled={updateGate.isPending}
                      >
                        Request Revision
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => handleAction(gate.id, 'REJECTED')}
                        disabled={updateGate.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add Review Gate">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="AI Output ID" required>
            <Input
              value={form.aiGeneratedOutputId}
              onChange={(e) => setForm((f) => ({ ...f, aiGeneratedOutputId: e.target.value }))}
              placeholder="Paste the AI output UUID"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Paste the UUID of the AI-generated output to gate.</p>
          </FormField>
          <FormField label="Review Stage" required>
            <Select
              value={form.stage}
              onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as ReviewGateStage }))}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_STYLES[s].label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes">
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGate.isPending}>
              {createGate.isPending ? 'Saving...' : 'Save Gate'}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
