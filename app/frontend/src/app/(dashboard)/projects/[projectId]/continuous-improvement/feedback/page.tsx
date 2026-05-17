'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useFeedbackEntries, useCreateFeedback } from '@/hooks/useContinuousImprovement'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import type { FeedbackType, FeedbackSeverity } from '@/types'

const FEEDBACK_TYPES: FeedbackType[] = [
  'HUMAN_REVIEW', 'GOVERNANCE_FLAG', 'HYPERCARE_OUTCOME',
  'TASK_OUTCOME', 'RISK_OBSERVED', 'AI_OUTPUT_PERFORMANCE',
]

const SEVERITIES: FeedbackSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const SEVERITY_COLORS: Record<FeedbackSeverity, string> = {
  LOW: 'text-gray-600 bg-gray-50 border-gray-200',
  MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-700 bg-red-50 border-red-200',
}

type FormState = {
  feedbackType: FeedbackType
  description: string
  severity: FeedbackSeverity
  confidenceScore: string
}

const EMPTY_FORM: FormState = {
  feedbackType: 'HUMAN_REVIEW',
  description: '',
  severity: 'MEDIUM',
  confidenceScore: '',
}

export default function FeedbackPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const [typeFilter, setTypeFilter] = useState<FeedbackType | ''>('')
  const [severityFilter, setSeverityFilter] = useState<FeedbackSeverity | ''>('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const params: Record<string, string> = {}
  if (typeFilter) params.feedbackType = typeFilter
  if (severityFilter) params.severity = severityFilter

  const { data: entries = [], isLoading } = useFeedbackEntries(projectId, params)
  const createFeedback = useCreateFeedback(projectId)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.description.trim()) { setFormError('Description is required'); return }
    try {
      await createFeedback.mutateAsync({
        feedbackType: form.feedbackType,
        description: form.description.trim(),
        severity: form.severity,
        ...(form.confidenceScore && { confidenceScore: Number(form.confidenceScore) }),
      })
      setSheetOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create feedback')
    }
  }

  if (isLoading) return <LoadingState />

  const severityCounts = SEVERITIES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = entries.filter(e => e.severity === s).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Entries"
        description="Collect and review feedback from hypercare, governance, and project delivery."
        action={<Button onClick={() => setSheetOpen(true)}>+ Add Feedback</Button>}
      />

      {/* Severity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SEVERITIES.map(s => (
          <button
            key={s}
            onClick={() => setSeverityFilter(severityFilter === s ? '' : s)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              severityFilter === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xl font-bold text-gray-900">{severityCounts[s] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s}</div>
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !typeFilter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          All Types
        </button>
        {FEEDBACK_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <EmptyState
          title="No feedback found"
          description={typeFilter || severityFilter ? 'Try adjusting the filters.' : 'Add the first feedback entry to start the improvement loop.'}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">By</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-sm">
                    <p className="text-gray-800 line-clamp-2">{entry.description}</p>
                    {entry.aiGeneratedOutput && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        AI Output: {entry.aiGeneratedOutput.title}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {entry.feedbackType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${SEVERITY_COLORS[entry.severity]}`}>
                      {entry.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {entry.confidenceScore != null ? `${Math.round(entry.confidenceScore)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {entry.createdByUser?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setForm(EMPTY_FORM); setFormError('') }}
        title="Add Feedback Entry"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{formError}</div>
          )}

          <FormField label="Feedback Type" required>
            <select
              value={form.feedbackType}
              onChange={e => setForm(f => ({ ...f, feedbackType: e.target.value as FeedbackType }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FEEDBACK_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Severity">
            <select
              value={form.severity}
              onChange={e => setForm(f => ({ ...f, severity: e.target.value as FeedbackSeverity }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEVERITIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
              placeholder="Describe the feedback in detail..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setSheetOpen(false); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFeedback.isPending}>
              {createFeedback.isPending ? 'Saving…' : 'Save Feedback'}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
