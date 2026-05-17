'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useBusinessProcesses, useCreateBusinessProcess, useAddProcessStep } from '@/hooks/useBusinessProcesses'
import { useWorkstreams } from '@/hooks/useWorkstreams'
import type { BusinessProcess } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

const CATEGORY_LABELS: Record<string, string> = {
  PROCURE_TO_PAY: 'Procure to Pay',
  ORDER_TO_CASH: 'Order to Cash',
  RECORD_TO_REPORT: 'Record to Report',
  INVENTORY_MANAGEMENT: 'Inventory',
  FIXED_ASSET: 'Fixed Asset',
  CRM: 'CRM',
  MANUFACTURING: 'Manufacturing',
  APPROVAL_WORKFLOW: 'Approval Workflow',
  REPORTING: 'Reporting',
  PROJECT_ACCOUNTING: 'Project Accounting',
}

const CATEGORY_COLORS: Record<string, string> = {
  PROCURE_TO_PAY: 'bg-purple-50 text-purple-700 border-purple-200',
  ORDER_TO_CASH: 'bg-blue-50 text-blue-700 border-blue-200',
  RECORD_TO_REPORT: 'bg-green-50 text-green-700 border-green-200',
  INVENTORY_MANAGEMENT: 'bg-orange-50 text-orange-700 border-orange-200',
  FIXED_ASSET: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CRM: 'bg-pink-50 text-pink-700 border-pink-200',
  MANUFACTURING: 'bg-red-50 text-red-700 border-red-200',
  APPROVAL_WORKFLOW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  REPORTING: 'bg-teal-50 text-teal-700 border-teal-200',
  PROJECT_ACCOUNTING: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

export default function ProcessesPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: processes = [], isLoading, isError, refetch } = useBusinessProcesses(projectId)
  const { data: workstreams = [] } = useWorkstreams(projectId)
  const createProcess = useCreateBusinessProcess(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<BusinessProcess | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [wsFilter, setWsFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')

  const filtered = processes.filter((p) => {
    if (wsFilter && p.workstreamId !== wsFilter) return false
    if (catFilter && p.processCategory !== catFilter) return false
    return true
  })

  async function handleCreateProcess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    const modules = (fd.get('modules') as string).split(',').map((m) => m.trim()).filter(Boolean)
    try {
      await createProcess.mutateAsync({
        processName: fd.get('name') as string,
        processCategory: fd.get('category') as string,
        workstreamId: fd.get('workstreamId') as string || undefined,
        currentState: fd.get('currentState') as string || undefined,
        futureState: fd.get('futureState') as string || undefined,
        impactedModules: modules.length > 0 ? modules : undefined,
      })
      setSheetOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  if (isLoading) return <LoadingState message="Loading processes..." />
  if (isError) return <div className="text-red-600 text-sm">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process Mapping"
        description="Map AS-IS and TO-BE business processes for this implementation"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>+ Add Process</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3">
        <select
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={wsFilter}
          onChange={(e) => setWsFilter(e.target.value)}
        >
          <option value="">All Workstreams</option>
          {workstreams.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
        </select>
        <select
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No processes mapped" description="Start mapping business processes to define AS-IS and TO-BE states." action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Process</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${CATEGORY_COLORS[p.processCategory] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {CATEGORY_LABELS[p.processCategory] ?? p.processCategory}
                  </span>
                  <span className="font-medium text-gray-900 text-sm">{p.processName}</span>
                  {p.workstream && <span className="text-xs text-gray-400">· {p.workstream.name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{p._count?.steps ?? 0} steps</span>
                  <button
                    onClick={() => { setSelectedProcess(p); setDetailOpen(true) }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View detail
                  </button>
                </div>
              </div>
              {(p.currentState || p.futureState) && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {p.currentState && (
                    <div className="rounded bg-gray-50 p-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">AS-IS (Current)</div>
                      <div className="text-xs text-gray-700 line-clamp-2">{p.currentState}</div>
                    </div>
                  )}
                  {p.futureState && (
                    <div className="rounded bg-blue-50 p-2">
                      <div className="text-xs font-medium text-blue-500 mb-1">TO-BE (Future)</div>
                      <div className="text-xs text-gray-700 line-clamp-2">{p.futureState}</div>
                    </div>
                  )}
                </div>
              )}
              {Array.isArray(p.impactedModules) && p.impactedModules.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(p.impactedModules as string[]).map((m) => (
                    <span key={m} className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">{m}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Process Sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="New Business Process">
        <form onSubmit={handleCreateProcess} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process Name *</label>
            <input name="name" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Vendor Bill Processing" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workstream</label>
            <select name="workstreamId" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">None</option>
              {workstreams.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AS-IS State</label>
            <textarea name="currentState" rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the current process..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TO-BE State</label>
            <textarea name="futureState" rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the future NetSuite process..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Impacted Modules (comma-separated)</label>
            <input name="modules" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Financial Management, Accounts Payable" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Create</Button>
          </div>
        </form>
      </Sheet>

      {/* Process Detail Sheet */}
      <Sheet open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedProcess?.processName ?? 'Process Detail'}>
        {selectedProcess && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${CATEGORY_COLORS[selectedProcess.processCategory] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {CATEGORY_LABELS[selectedProcess.processCategory]}
              </span>
            </div>
            {selectedProcess.currentState && (
              <div className="rounded bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">AS-IS (Current State)</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedProcess.currentState}</div>
              </div>
            )}
            {selectedProcess.futureState && (
              <div className="rounded bg-blue-50 p-3">
                <div className="text-xs font-semibold text-blue-500 mb-1">TO-BE (Future State)</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedProcess.futureState}</div>
              </div>
            )}
            {Array.isArray(selectedProcess.impactedModules) && selectedProcess.impactedModules.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Impacted Modules</div>
                <div className="flex flex-wrap gap-1">
                  {(selectedProcess.impactedModules as string[]).map((m) => (
                    <span key={m} className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedProcess.steps && selectedProcess.steps.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Process Steps</div>
                <div className="space-y-2">
                  {selectedProcess.steps.map((step) => (
                    <div key={step.id} className="flex gap-3 rounded border border-gray-100 p-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{step.stepOrder}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{step.title}</div>
                        {step.actor && <div className="text-xs text-gray-400">Actor: {step.actor}</div>}
                        {step.description && <div className="text-xs text-gray-600 mt-0.5">{step.description}</div>}
                        {step.approvalRequired && <span className="text-xs text-orange-600 font-medium">⚠ Approval required</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
