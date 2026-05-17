'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSopDocuments, useGenerateSop, useUpdateSopDocument } from '@/hooks/useSopDocuments'
import { useBusinessProcesses } from '@/hooks/useBusinessProcesses'
import type { SopDocument, SopStatus } from '@/types'
import { SopStatusBadge } from '@/components/ai/SopStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'

type SopTab = 'overview' | 'steps' | 'approval' | 'exceptions'

const SOP_TABS: { id: SopTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'steps', label: 'Process Steps' },
  { id: 'approval', label: 'Approval Flow' },
  { id: 'exceptions', label: 'Exceptions' },
]

function SopDetail({ sop }: { sop: SopDocument }) {
  const [tab, setTab] = useState<SopTab>('overview')
  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {SOP_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && (
        <div className="space-y-3">
          {sop.purpose && <div><div className="text-xs font-semibold text-gray-500 mb-1">Purpose</div><div className="text-sm text-gray-700">{sop.purpose}</div></div>}
          {sop.scope && <div><div className="text-xs font-semibold text-gray-500 mb-1">Scope</div><div className="text-sm text-gray-700">{sop.scope}</div></div>}
          {sop.responsibilities && <div><div className="text-xs font-semibold text-gray-500 mb-1">Responsibilities</div><div className="text-sm text-gray-700 whitespace-pre-wrap">{sop.responsibilities}</div></div>}
        </div>
      )}
      {tab === 'steps' && (
        <div>
          {sop.processSteps ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono text-xs bg-gray-50 rounded border border-gray-100 p-3">{sop.processSteps}</div>
          ) : (
            <div className="text-sm text-gray-400">No process steps defined.</div>
          )}
        </div>
      )}
      {tab === 'approval' && (
        <div>
          {sop.approvalFlow ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{sop.approvalFlow}</div>
          ) : (
            <div className="text-sm text-gray-400">No approval flow defined.</div>
          )}
        </div>
      )}
      {tab === 'exceptions' && (
        <div>
          {sop.exceptionHandling ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{sop.exceptionHandling}</div>
          ) : (
            <div className="text-sm text-gray-400">No exception handling defined.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SopPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: sops = [], isLoading, isError, refetch } = useSopDocuments(projectId)
  const { data: processes = [] } = useBusinessProcesses(projectId)
  const generateSop = useGenerateSop(projectId)
  const updateSop = useUpdateSopDocument(projectId)

  const [selectedSop, setSelectedSop] = useState<SopDocument | undefined>()
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedProcessId, setSelectedProcessId] = useState('')
  const [runError, setRunError] = useState('')

  async function handleGenerate() {
    if (!selectedProcessId) return
    setRunError('')
    try {
      const newSop = await generateSop.mutateAsync({ processId: selectedProcessId })
      setGenerateDialogOpen(false)
      setSelectedProcessId('')
      if (newSop.data) setSelectedSop(newSop.data as SopDocument)
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Failed to generate SOP')
    }
  }

  async function handleStatusChange(sopId: string, status: SopStatus) {
    await updateSop.mutateAsync({ sopId, data: { status } })
    if (selectedSop?.id === sopId) setSelectedSop((prev) => prev ? { ...prev, status } : prev)
  }

  if (isLoading) return <LoadingState message="Loading SOPs..." />
  if (isError) return <div className="text-red-600 text-sm">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="SOP Documents"
        description="AI-generated Standard Operating Procedures for NetSuite processes"
        action={<Button size="sm" onClick={() => setGenerateDialogOpen(true)}>Generate SOP</Button>}
      />

      {runError && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{runError}</div>}

      {/* Generate Dialog */}
      {generateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-900 mb-4">Generate SOP from Business Process</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Business Process</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedProcessId}
                onChange={(e) => setSelectedProcessId(e.target.value)}
              >
                <option value="">Select a process...</option>
                {processes.map((p) => (
                  <option key={p.id} value={p.id}>{p.processName}</option>
                ))}
              </select>
              {processes.length === 0 && <p className="text-xs text-gray-400 mt-1">No processes found. Add processes first.</p>}
            </div>
            {runError && <p className="text-sm text-red-600 mb-3">{runError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleGenerate} disabled={!selectedProcessId || generateSop.isPending}>
                {generateSop.isPending ? 'Generating...' : 'Generate SOP'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* SOP List */}
        <div className="w-72 flex-shrink-0 space-y-2">
          {sops.length === 0 ? (
            <EmptyState
              title="No SOPs yet"
              description="Generate SOPs from your mapped business processes."
              action={<Button size="sm" onClick={() => setGenerateDialogOpen(true)}>Generate SOP</Button>}
            />
          ) : (
            sops.map((sop) => (
              <button
                key={sop.id}
                onClick={() => setSelectedSop(sop)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${selectedSop?.id === sop.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <SopStatusBadge status={sop.status} />
                  <span className="text-xs text-gray-400">v{sop.version}</span>
                </div>
                <div className="font-medium text-gray-900 text-xs line-clamp-2">{sop.title}</div>
                {sop.purpose && <div className="text-xs text-gray-400 mt-1 line-clamp-1">{sop.purpose}</div>}
              </button>
            ))
          )}
        </div>

        {/* SOP Detail */}
        {selectedSop ? (
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">{selectedSop.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <SopStatusBadge status={selectedSop.status} />
                  <span className="text-xs text-gray-400">Version {selectedSop.version}</span>
                  {selectedSop.generatedByAgent && <span className="text-xs text-gray-400">· Generated by {selectedSop.generatedByAgent}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSop.status}
                  onChange={(e) => handleStatusChange(selectedSop.id, e.target.value as SopStatus)}
                  className="text-xs rounded border border-gray-200 px-2 py-1 focus:outline-none"
                >
                  {(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as SopStatus[]).map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <SopDetail sop={selectedSop} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 rounded-lg border border-dashed border-gray-200">
            Select a SOP to view its content
          </div>
        )}
      </div>
    </div>
  )
}
