'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'

type WorkstreamDashboardData = {
  workstreamType: 'FUNCTIONAL' | 'TECHNICAL'
  workstream: { id: string; name: string; status: string; progressPercentage: number; projectName: string }
  metrics: Record<string, number>
  uatByStatus?: { status: string; _count: number }[]
  sopsByStatus?: { status: string; _count: number }[]
  deliverablesByStatus?: { status: string; _count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'text-gray-600 bg-gray-100',
  ACTIVE: 'text-green-700 bg-green-100',
  BLOCKED: 'text-red-700 bg-red-100',
  COMPLETED: 'text-purple-700 bg-purple-100',
  ON_HOLD: 'text-yellow-700 bg-yellow-100',
}

export default function WorkstreamDashboardPage() {
  const params = useParams()
  const workstreamId = params.workstreamId as string

  const { data, isLoading, error } = useQuery({
    queryKey: ['workstream-dashboard', workstreamId],
    queryFn: () =>
      dashboardApi.getWorkstreamDashboard(workstreamId).then(r => r.data as WorkstreamDashboardData),
    enabled: !!workstreamId,
  })

  if (isLoading) return <LoadingState />

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load workstream dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { workstreamType, workstream, metrics } = data
  const isFunctional = workstreamType === 'FUNCTIONAL'
  const statusColor = STATUS_COLORS[workstream.status] ?? 'text-gray-600 bg-gray-100'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{workstream.name}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
              {workstream.status}
            </span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
              {workstreamType}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{workstream.projectName}</p>
        </div>
      </div>

      <Link href="/dashboard/executive" className="text-sm text-blue-600 hover:text-blue-800">
        &larr; Executive Dashboard
      </Link>

      {/* Overall Progress */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Overall Progress</h2>
        <ProgressBar
          value={workstream.progressPercentage}
          label="Workstream Completion"
          color={
            workstream.progressPercentage >= 80 ? 'bg-green-500' :
            workstream.progressPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
          }
        />
      </div>

      {/* Functional Metrics */}
      {isFunctional && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Functional Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard label="Business Processes" value={metrics.processCount ?? 0} color="blue" />
            <KpiCard
              label="UAT Pass Rate"
              value={`${metrics.uatPassRate ?? 0}%`}
              color={(metrics.uatPassRate ?? 0) >= 80 ? 'green' : (metrics.uatPassRate ?? 0) >= 60 ? 'yellow' : 'red'}
            />
            <KpiCard label="SOP Documents" value={metrics.sopCount ?? 0} color="gray" />
            <KpiCard label="Deliverables" value={metrics.deliverableCount ?? 0} color="gray" />
          </div>
          {(metrics.uatTotal ?? 0) > 0 && (
            <ProgressBar
              value={metrics.uatPassRate ?? 0}
              label="UAT Pass Rate"
              color={(metrics.uatPassRate ?? 0) >= 80 ? 'bg-green-500' : (metrics.uatPassRate ?? 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
            />
          )}
        </div>
      )}

      {/* Technical Metrics */}
      {!isFunctional && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Technical Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <KpiCard label="Technical Deliverables" value={metrics.deliverableCount ?? 0} color="blue" />
          </div>
          {data.deliverablesByStatus && data.deliverablesByStatus.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Delivery Status Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.deliverablesByStatus.map(({ status, _count }) => (
                  <div key={status} className="rounded-md bg-gray-50 border border-gray-200 p-3">
                    <div className="text-lg font-bold text-gray-900">{_count}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{status.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
