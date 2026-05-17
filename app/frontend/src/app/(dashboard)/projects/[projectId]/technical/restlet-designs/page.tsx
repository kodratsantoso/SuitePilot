'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRestletDesigns, useCreateRestletDesign } from '@/hooks/useRestletDesigns'
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

function RestletForm({
  onSubmit,
  onCancel,
  error,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  error?: string
}) {
  const [name, setName] = useState('')
  const [endpointUrl, setEndpointUrl] = useState('')
  const [method, setMethod] = useState<RestletMethod>('GET')
  const [authenticationType, setAuthenticationType] = useState('')
  const [errorHandlingStrategy, setErrorHandlingStrategy] = useState('')
  const [requestSchema, setRequestSchema] = useState('')
  const [responseSchema, setResponseSchema] = useState('')
  const [notes, setNotes] = useState('')
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
      name,
      endpointUrl: endpointUrl || undefined,
      method,
      authenticationType: authenticationType || undefined,
      errorHandlingStrategy: errorHandlingStrategy || undefined,
      requestSchema: parsedRequest,
      responseSchema: parsedResponse,
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
          placeholder="e.g. Customer Search RESTlet"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          placeholder="e.g. /app/site/hosting/restlet.nl?script=123&deploy=1"
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Type</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={authenticationType}
          onChange={(e) => setAuthenticationType(e.target.value)}
          placeholder="e.g. TBA, OAuth 2.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Error Handling Strategy</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={errorHandlingStrategy}
          onChange={(e) => setErrorHandlingStrategy(e.target.value)}
          placeholder="Describe error handling approach..."
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

export default function RestletDesignsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: restlets = [], isLoading, isError, refetch } = useRestletDesigns(projectId)
  const createRestlet = useCreateRestletDesign(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      await createRestlet.mutateAsync(data)
      setSheetOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  if (isLoading) return <LoadingState message="Loading RESTlet designs..." />
  if (isError) return (
    <div className="text-red-600 text-sm">
      Failed to load RESTlet designs. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="RESTlet Designs"
        description="Design and document NetSuite RESTlet endpoints, schemas and authentication"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>+ Add RESTlet</Button>}
      />

      {restlets.length === 0 ? (
        <EmptyState
          title="No RESTlet designs yet"
          description="Document your RESTlet endpoints to capture design, schemas and authentication details."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add RESTlet</Button>}
        />
      ) : (
        <div className="space-y-3">
          {restlets.map((restlet) => {
            const expanded = expandedId === restlet.id
            return (
              <div key={restlet.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{restlet.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${METHOD_COLORS[restlet.method]}`}>
                          {restlet.method}
                        </span>
                        <TechnicalStatusBadge status={restlet.status} />
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">v{restlet.version}</span>
                      </div>
                      {restlet.endpointUrl && (
                        <code className="block mt-1.5 text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded truncate">
                          {restlet.endpointUrl}
                        </code>
                      )}
                      {restlet.authenticationType && (
                        <div className="text-xs text-gray-400 mt-1">Auth: {restlet.authenticationType}</div>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedId(expanded ? null : restlet.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      {expanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                    {restlet.errorHandlingStrategy && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Error Handling Strategy</div>
                        <p className="text-sm text-gray-700">{restlet.errorHandlingStrategy}</p>
                      </div>
                    )}
                    {restlet.requestSchema && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Request Schema</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(restlet.requestSchema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {restlet.responseSchema && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Response Schema</div>
                        <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(restlet.responseSchema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {restlet.notes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</div>
                        <p className="text-sm text-gray-700">{restlet.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setFormError('') }} title="New RESTlet Design">
        <RestletForm
          onSubmit={handleSubmit}
          onCancel={() => { setSheetOpen(false); setFormError('') }}
          error={formError}
        />
      </Sheet>
    </div>
  )
}
