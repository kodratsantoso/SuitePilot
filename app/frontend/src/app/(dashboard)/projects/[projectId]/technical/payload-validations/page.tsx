'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { usePayloadValidations, useCreatePayloadValidation } from '@/hooks/usePayloadValidations'
import type { PayloadType, TechnicalStatus } from '@/types'
import { TechnicalStatusBadge } from '@/components/ai/TechnicalStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

const PAYLOAD_TYPE_COLORS: Record<PayloadType, string> = {
  REQUEST: 'text-blue-700 bg-blue-50 border-blue-200',
  RESPONSE: 'text-green-700 bg-green-50 border-green-200',
}

const PAYLOAD_TYPE_OPTIONS: PayloadType[] = ['REQUEST', 'RESPONSE']
const STATUS_OPTIONS: TechnicalStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED']

function PayloadValidationForm({
  onSubmit,
  onCancel,
  error,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  error?: string
}) {
  const [name, setName] = useState('')
  const [payloadType, setPayloadType] = useState<PayloadType>('REQUEST')
  const [schema, setSchema] = useState('')
  const [validationRules, setValidationRules] = useState('')
  const [samplePayload, setSamplePayload] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<TechnicalStatus>('DRAFT')
  const [jsonError, setJsonError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setJsonError('')

    let parsedSchema: Record<string, unknown> | undefined
    let parsedRules: Record<string, unknown> | undefined

    if (schema.trim()) {
      try {
        parsedSchema = JSON.parse(schema)
      } catch {
        setJsonError('Schema: Invalid JSON')
        return
      }
    }
    if (validationRules.trim()) {
      try {
        parsedRules = JSON.parse(validationRules)
      } catch {
        setJsonError('Validation Rules: Invalid JSON')
        return
      }
    }

    onSubmit({
      name,
      payloadType,
      schema: parsedSchema,
      validationRules: parsedRules,
      samplePayload: samplePayload || undefined,
      notes: notes || undefined,
      status,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Customer Create Request Validation"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payload Type</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={payloadType}
            onChange={(e) => setPayloadType(e.target.value as PayloadType)}
          >
            {PAYLOAD_TYPE_OPTIONS.map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value as TechnicalStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Schema (JSON)</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          placeholder='{"type": "object", "required": ["name"], "properties": {...}}'
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Validation Rules (JSON)</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={validationRules}
          onChange={(e) => setValidationRules(e.target.value)}
          placeholder='{"rules": [{"field": "email", "type": "email"}]}'
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sample Payload</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={samplePayload}
          onChange={(e) => setSamplePayload(e.target.value)}
          placeholder="Paste a sample payload here..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
        />
      </div>
      {(jsonError || error) && <p className="text-sm text-red-600">{jsonError || error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm">Create</Button>
      </div>
    </form>
  )
}

export default function PayloadValidationsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [filterType, setFilterType] = useState('')

  const params: Record<string, string> = {}
  if (filterType) params.payloadType = filterType

  const { data: validations = [], isLoading, isError, refetch } = usePayloadValidations(projectId, Object.keys(params).length ? params : undefined)
  const createValidation = useCreatePayloadValidation(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      await createValidation.mutateAsync(data)
      setSheetOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  if (isLoading) return <LoadingState message="Loading payload validations..." />
  if (isError) return (
    <div className="text-red-600 text-sm">
      Failed to load payload validations. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payload Validations"
        description="Manage JSON schema validation rules, sample payloads and validation logic"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>+ Add Validation</Button>}
      />

      {/* Filter */}
      <div className="flex gap-3">
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {PAYLOAD_TYPE_OPTIONS.map((pt) => (
            <option key={pt} value={pt}>{pt}</option>
          ))}
        </select>
      </div>

      {validations.length === 0 ? (
        <EmptyState
          title="No payload validations yet"
          description="Define payload validation schemas to ensure data integrity in your integrations."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Validation</Button>}
        />
      ) : (
        <div className="space-y-3">
          {validations.map((validation) => {
            const expanded = expandedId === validation.id
            return (
              <div key={validation.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{validation.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${PAYLOAD_TYPE_COLORS[validation.payloadType]}`}>
                          {validation.payloadType}
                        </span>
                        <TechnicalStatusBadge status={validation.status} />
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">v{validation.version}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expanded ? null : validation.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      {expanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                    {validation.schema && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Schema</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(validation.schema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {validation.validationRules && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Validation Rules</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(validation.validationRules, null, 2)}
                        </pre>
                      </div>
                    )}
                    {validation.samplePayload && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sample Payload</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {validation.samplePayload}
                        </pre>
                      </div>
                    )}
                    {validation.notes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</div>
                        <p className="text-sm text-gray-700">{validation.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setFormError('') }} title="New Payload Validation">
        <PayloadValidationForm
          onSubmit={handleSubmit}
          onCancel={() => { setSheetOpen(false); setFormError('') }}
          error={formError}
        />
      </Sheet>
    </div>
  )
}
