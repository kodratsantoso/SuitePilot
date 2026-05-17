'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useIntegrationMappings, useCreateIntegrationMapping } from '@/hooks/useIntegrationMappings'
import type { IntegrationMethod, TechnicalStatus } from '@/types'
import { TechnicalStatusBadge } from '@/components/ai/TechnicalStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

const METHOD_COLORS: Record<IntegrationMethod, string> = {
  REST: 'text-blue-700 bg-blue-50 border-blue-200',
  SOAP: 'text-purple-700 bg-purple-50 border-purple-200',
  FILE_BASED: 'text-orange-700 bg-orange-50 border-orange-200',
}

const STATUS_OPTIONS: TechnicalStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED']
const METHOD_OPTIONS: IntegrationMethod[] = ['REST', 'SOAP', 'FILE_BASED']

function IntegrationForm({
  onSubmit,
  onCancel,
  error,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  error?: string
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sourceSystem, setSourceSystem] = useState('')
  const [targetSystem, setTargetSystem] = useState('')
  const [integrationMethod, setIntegrationMethod] = useState<IntegrationMethod>('REST')
  const [dataFlowNotes, setDataFlowNotes] = useState('')
  const [authMethod, setAuthMethod] = useState('')
  const [assumptions, setAssumptions] = useState('')
  const [risks, setRisks] = useState('')
  const [status, setStatus] = useState<TechnicalStatus>('DRAFT')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          name,
          description: description || undefined,
          sourceSystem,
          targetSystem,
          integrationMethod,
          dataFlowNotes: dataFlowNotes || undefined,
          authMethod: authMethod || undefined,
          assumptions: assumptions || undefined,
          risks: risks || undefined,
          status,
        })
      }}
      className="space-y-4 p-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Salesforce → NetSuite Order Sync"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source System *</label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
            required
            placeholder="e.g. Salesforce"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target System *</label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={targetSystem}
            onChange={(e) => setTargetSystem(e.target.value)}
            required
            placeholder="e.g. NetSuite"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Integration Method</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={integrationMethod}
            onChange={(e) => setIntegrationMethod(e.target.value as IntegrationMethod)}
          >
            {METHOD_OPTIONS.map((m) => (
              <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Auth Method</label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={authMethod}
          onChange={(e) => setAuthMethod(e.target.value)}
          placeholder="e.g. OAuth 2.0, API Key, Token-Based"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Flow Notes</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={dataFlowNotes}
          onChange={(e) => setDataFlowNotes(e.target.value)}
          placeholder="Describe the data flow and mapping logic..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assumptions</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={assumptions}
          onChange={(e) => setAssumptions(e.target.value)}
          placeholder="Key assumptions for this integration..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Risks</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={risks}
          onChange={(e) => setRisks(e.target.value)}
          placeholder="Known risks and mitigation strategies..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm">Create</Button>
      </div>
    </form>
  )
}

export default function IntegrationMappingsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMethod, setFilterMethod] = useState('')

  const params: Record<string, string> = {}
  if (filterStatus) params.status = filterStatus
  if (filterMethod) params.integrationMethod = filterMethod

  const { data: mappings = [], isLoading, isError, refetch } = useIntegrationMappings(projectId, Object.keys(params).length ? params : undefined)
  const createMapping = useCreateIntegrationMapping(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      await createMapping.mutateAsync(data)
      setSheetOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  if (isLoading) return <LoadingState message="Loading integration mappings..." />
  if (isError) return (
    <div className="text-red-600 text-sm">
      Failed to load integration mappings. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integration Mappings"
        description="Document system integrations, data flows, authentication methods and risks"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>+ Add Integration</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
        >
          <option value="">All Methods</option>
          {METHOD_OPTIONS.map((m) => (
            <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {mappings.length === 0 ? (
        <EmptyState
          title="No integration mappings yet"
          description="Document your system integrations to track data flows and dependencies."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Integration</Button>}
        />
      ) : (
        <div className="space-y-3">
          {mappings.map((mapping) => {
            const expanded = expandedId === mapping.id
            return (
              <div key={mapping.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{mapping.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${METHOD_COLORS[mapping.integrationMethod]}`}>
                          {mapping.integrationMethod.replace(/_/g, ' ')}
                        </span>
                        <TechnicalStatusBadge status={mapping.status} />
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">v{mapping.version}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-sm">
                        <span className="text-gray-700 font-medium">{mapping.sourceSystem}</span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" d="M3 8h10M9 5l4 3-4 3" />
                        </svg>
                        <span className="text-gray-700 font-medium">{mapping.targetSystem}</span>
                      </div>
                      {mapping.authMethod && (
                        <div className="text-xs text-gray-400 mt-1">Auth: {mapping.authMethod}</div>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedId(expanded ? null : mapping.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      {expanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                    {mapping.dataFlowNotes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Data Flow Notes</div>
                        <p className="text-sm text-gray-700">{mapping.dataFlowNotes}</p>
                      </div>
                    )}
                    {mapping.assumptions && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assumptions</div>
                        <p className="text-sm text-gray-700">{mapping.assumptions}</p>
                      </div>
                    )}
                    {mapping.risks && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Risks</div>
                        <p className="text-sm text-gray-700">{mapping.risks}</p>
                      </div>
                    )}
                    {mapping.frequencyNotes && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Frequency</div>
                        <p className="text-sm text-gray-700">{mapping.frequencyNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setFormError('') }} title="New Integration Mapping">
        <IntegrationForm
          onSubmit={handleSubmit}
          onCancel={() => { setSheetOpen(false); setFormError('') }}
          error={formError}
        />
      </Sheet>
    </div>
  )
}
