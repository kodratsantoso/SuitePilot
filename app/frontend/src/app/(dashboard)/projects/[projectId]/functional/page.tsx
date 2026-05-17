'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useWorkstreams } from '@/hooks/useWorkstreams'
import { useFitGapAnalysis } from '@/hooks/useFitGap'
import { useUatScenarios } from '@/hooks/useUatScenarios'
import { useSopDocuments } from '@/hooks/useSopDocuments'
import { useBusinessProcesses } from '@/hooks/useBusinessProcesses'
import { WorkstreamStatusBadge } from '@/components/ai/WorkstreamStatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'

const NAV_CARDS = [
  { href: 'functional/workstreams', title: 'Workstreams', description: 'Manage functional workstreams and track progress' },
  { href: 'functional/processes', title: 'Process Mapping', description: 'Map AS-IS and TO-BE business processes' },
  { href: 'functional/fit-gap', title: 'Fit-Gap Analysis', description: 'AI-powered requirement classification' },
  { href: 'functional/uat', title: 'UAT Scenarios', description: 'AI-generated test scenarios and execution tracking' },
  { href: 'functional/sop', title: 'SOP Documents', description: 'AI-generated standard operating procedures' },
]

export default function FunctionalDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: workstreams = [], isLoading: loadingWS } = useWorkstreams(projectId)
  const { data: processes = [] } = useBusinessProcesses(projectId)
  const { data: fitGap = [] } = useFitGapAnalysis(projectId)
  const { data: uat = [] } = useUatScenarios(projectId)
  const { data: sops = [] } = useSopDocuments(projectId)

  const uatPassed = uat.filter((u) => u.status === 'PASSED').length
  const uatFailed = uat.filter((u) => u.status === 'FAILED').length
  const gapCount = fitGap.filter((f) => f.fitCategory === 'GAP').length

  if (loadingWS) return <LoadingState message="Loading functional workspace..." />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Functional Delivery</h1>
        <p className="mt-1 text-sm text-gray-500">AI-assisted functional implementation workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Workstreams', value: workstreams.length },
          { label: 'Processes', value: processes.length },
          { label: 'Fit-Gap Items', value: fitGap.length, sub: gapCount > 0 ? `${gapCount} gaps` : undefined },
          { label: 'UAT Scenarios', value: uat.length, sub: uat.length > 0 ? `${uatPassed} passed` : undefined },
          { label: 'SOPs', value: sops.length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            {s.sub && <div className="text-xs text-blue-600 mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Workstreams */}
      {workstreams.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Workstreams</h2>
          <div className="space-y-2">
            {workstreams.map((ws) => (
              <div key={ws.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <WorkstreamStatusBadge status={ws.status} />
                  <span className="font-medium text-gray-900 text-sm">{ws.name}</span>
                  {ws.owner && <span className="text-xs text-gray-400">· {ws.owner.name}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-400">{ws._count?.businessProcesses ?? 0} processes</div>
                  <div className="w-24">
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                      <span>{ws.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${ws.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Functional Tools</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="font-medium text-gray-900 text-sm">{card.title}</div>
              <div className="text-xs text-gray-500 mt-1">{card.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
