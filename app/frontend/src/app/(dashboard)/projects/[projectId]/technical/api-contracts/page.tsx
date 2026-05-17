'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useApiContracts, useCreateApiContract } from '@/hooks/useApiContracts'
import type { RestletMethod, TechnicalStatus } from '@/types'
import { TechnicalStatusBadge } from '@/components/ai/TechnicalStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

const METHOD_COLORS: Record<RestletMethod, string> = {
  GET: 'text-green-700 bg-green-50 border-green-200',
  POST: 'text-blue-700 bg-blue-50 border-blue-200',
  PUT: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  DELETE: 'text-red-700 bg-red-50 border-red-200',
}

const METHOD_OPTIONS: RestletMethod[] = ['GET', 'POST', 'PUT', 'DELETE']
const STATUS_OPTIONS: TechnicalStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED']

function ApiContractForm({
  onSubmit,
  onCancel,
  error,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  error?: string
}) {
  const [endpoint, setEndpoint] = useState('')
  const [method, setMethod] = useState<RestletMethod>('GET')
  const [authRequired, setAuthRequired] = useState(true)
  const [errorHandling, setErrorHandling] = useState('')
  const [notes, setNotes] = useState('')
  const [requestSchema, setRequestSchema] = useState('')
  const [responseSchema, setResponseSchema] = useState('')
  const [status, setStatus] = useState<TechnicalStatus>('DRAFT')
  const [jsonError, setJsonError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setJsonError('')

    let parsedRequest: Record<string, unknown> | undefined
    let parsedResponse: Record<string, unknown> | undefined

    if (requestSchema.trim()) {
      try {
        parsedRequest = JSON.parse(requestSchema)
      } catch {
        setJsonError('Request Schema: Invalid JSON')
        return
      }
    }
    if (responseSchema.trim()) {
      try {
        parsedResponse = JSON.parse(responseSchema)
      } catch {
        setJsonError('Response Schema: Invalid JSON')
        return
      }
    }

    onSubmit({
      endpoint,
      method,
      authRequired,
      errorHandling: errorHandling || undefined,
      notes: notes || undefined,
      requestSchema: parsedRequest,
      responseSchema: parsedResponse,
      status,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint *</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          required
          placeholder="e.g. /api/v1/customers"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={method}
            onChange={(e) => setMethod(e.target.value as RestletMethod)}
          >
            {METHOD_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
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
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="authRequired"
          checked={authRequired}
          onChange={(e) => setAuthRequired(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="authRequired" className="text-sm font-medium text-gray-700">Authentication Required</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Error Handling</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={errorHandling}
          onChange={(e) => setErrorHandling(e.target.value)}
          placeholder="Describe error codes, retry logic and fallback strategies..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Request Schema (JSON)</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={requestSchema}
          onChange={(e) => setRequestSchema(e.target.value)}
          placeholder='{"type": "object", "properties": {...}}'
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Response Schema (JSON)</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={responseSchema}
          onChange={(e) => setResponseSchema(e.target.value)}
          placeholder='{"type": "object", "properties": {...}}'
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

export default function ApiContractsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: contracts = [], isLoading, isError, refetch } = useApiContracts(projectId)
  const createContract = useCreateApiContract(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      await createContract.mutateAsync(data)
      setSheetOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  if (isLoading) return <LoadingState message="Loading API contracts..." />
  if (isError) return (
    <div className="text-red-600 text-sm">
      Failed to load API contracts. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Contracts"
        description="Define API endpoint schemas, request/response contracts and error handling"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>+ Add Contract</Button>}
      />

      {contracts.length === 0 ? (
        <EmptyState
          title="No API contracts yet"
          description="Define API contracts to document endpoint schemas, authentication and error handling."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Contract</Button>}
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const expanded = expandedId === contract.id
            return (
              <div key={contract.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${METHOD_COLORS[contract.method]}`}>
                          {contract.method}
                        </span>
                        <code className="font-mono text-sm text-gray-800 font-medium">{contract.endpoint}</code>
                        <TechnicalStatusBadge status={contract.status} />
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">v{contract.version}</span>
                        {contract.authRequired && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                              <rect x="3" y="7" width="10" height="7" rx="1" />
                              <path strokeLinecap="round" d="M5 7V5a3 3 0 016 0v2" />
                            </svg>
                            Auth required
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expanded ? null : contract.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      {expanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                    {contract.errorHandling && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Error Handling</div>
                        <p className="text-sm text-gray-700">{contract.errorHandling}</p>
                      </div>
                    )}
                    {contract.queryParams && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Query Parameters</div>
                        <pre className="text-xs font-mono bg-white p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(contract.queryParams, null, 2)}
                        </pre>
                      </div>
                    )}
                    {contract.requestSchema && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Request Schema</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(contract.requestSchema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {contract.responseSchema && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Response Schema</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(contract.responseSchema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {contract.notes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</div>
                        <p className="text-sm text-gray-700">{contract.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setFormError('') }} title="New API Contract">
        <ApiContractForm
          onSubmit={handleSubmit}
          onCancel={() => { setSheetOpen(false); setFormError('') }}
          error={formError}
        />
      </Sheet>
    </div>
  )
}
