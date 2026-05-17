'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useOutputValidations, useCreateOutputValidation } from '@/hooks/useGovernance'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ValidationResultBadge } from '@/components/ai/ValidationResultBadge'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { FormField } from '@/components/ui/FormField'
import { Input, Select } from '@/components/ui/Input'
import type { ValidationType, ValidationResult } from '@/types'

const VALIDATION_TYPE_STYLES: Record<ValidationType, { bg: string; text: string; border: string; label: string }> = {
  SCHEMA_CHECK: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Schema Check' },
  DATA_CONSISTENCY: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Data Consistency' },
  BUSINESS_RULE_CHECK: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Business Rule Check' },
}

function ValidationTypeBadge({ type }: { type: ValidationType }) {
  const s = VALIDATION_TYPE_STYLES[type]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${s.bg} ${s.border} ${s.text}`}>
      {s.label}
    </span>
  )
}

const VALIDATION_TYPES: ValidationType[] = ['SCHEMA_CHECK', 'DATA_CONSISTENCY', 'BUSINESS_RULE_CHECK']
const RESULTS: ValidationResult[] = ['PASS', 'WARNING', 'FAIL']

interface CreateForm {
  aiGeneratedOutputId: string
  validationType: ValidationType
  result: ValidationResult
  notes: string
}

export default function ValidationsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const [filterResult, setFilterResult] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<CreateForm>({
    aiGeneratedOutputId: '',
    validationType: 'SCHEMA_CHECK',
    result: 'PASS',
    notes: '',
  })

  const params: Record<string, string> = {}
  if (filterResult) params.result = filterResult
  if (filterType) params.validationType = filterType

  const { data: validations = [], isLoading } = useOutputValidations(projectId, Object.keys(params).length > 0 ? params : undefined)
  const createValidation = useCreateOutputValidation(projectId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.aiGeneratedOutputId.trim()) return
    await createValidation.mutateAsync({
      aiGeneratedOutputId: form.aiGeneratedOutputId.trim(),
      validationType: form.validationType,
      result: form.result,
      notes: form.notes || undefined,
    })
    setSheetOpen(false)
    setForm({ aiGeneratedOutputId: '', validationType: 'SCHEMA_CHECK', result: 'PASS', notes: '' })
  }

  if (isLoading) return <LoadingState message="Loading validations..." />

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Output Validations"
          description="Schema checks, data consistency, and business rule validations for AI-generated outputs."
        />
        <Button onClick={() => setSheetOpen(true)}>Add Validation</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="w-40"
        >
          <option value="">All Results</option>
          {RESULTS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-52"
        >
          <option value="">All Types</option>
          {VALIDATION_TYPES.map((t) => (
            <option key={t} value={t}>{VALIDATION_TYPE_STYLES[t].label}</option>
          ))}
        </Select>
      </div>

      {/* List */}
      {validations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M4 8l3 3 5-5" />
              <circle cx="8" cy="8" r="6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No validations recorded yet</p>
          <p className="mt-1 text-xs text-gray-400">Add a validation to track the quality of AI outputs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {validations.map((v) => (
            <div key={v.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {v.output && (
                    <div className="text-sm font-semibold text-gray-900 truncate">{v.output.title}</div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ValidationTypeBadge type={v.validationType} />
                    <ValidationResultBadge result={v.result} />
                  </div>
                  {v.notes && (
                    <p className="mt-2 text-xs text-gray-500">{v.notes}</p>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {new Date(v.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add Output Validation">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="AI Output ID" required>
            <Input
              value={form.aiGeneratedOutputId}
              onChange={(e) => setForm((f) => ({ ...f, aiGeneratedOutputId: e.target.value }))}
              placeholder="Paste the AI output UUID"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Paste the UUID of the AI-generated output to validate.</p>
          </FormField>
          <FormField label="Validation Type" required>
            <Select
              value={form.validationType}
              onChange={(e) => setForm((f) => ({ ...f, validationType: e.target.value as ValidationType }))}
            >
              {VALIDATION_TYPES.map((t) => (
                <option key={t} value={t}>{VALIDATION_TYPE_STYLES[t].label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Result" required>
            <Select
              value={form.result}
              onChange={(e) => setForm((f) => ({ ...f, result: e.target.value as ValidationResult }))}
            >
              {RESULTS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes">
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes about this validation"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createValidation.isPending}>
              {createValidation.isPending ? 'Saving...' : 'Save Validation'}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
