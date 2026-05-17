'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProjectDashboard } from '@/hooks/useDashboard'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { RagBar } from '@/components/dashboard/RagBar'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { MiniBarChart } from '@/components/dashboard/MiniBarChart'
import { useKpiTrends } from '@/hooks/useDashboard'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectHealthBadge } from '@/components/projects/ProjectHealthBadge'
import { LoadingState } from '@/components/shared/LoadingState'

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const { data, isLoading, error } = useProjectDashboard(projectId)
  const { data: taskTrend = [] } = useKpiTrends({ projectId, metric: 'task_completion', timeRange: 14 })
  const { data: issueTrend = [] } = useKpiTrends({ projectId, metric: 'issue_count', timeRange: 14 })

  if (isLoading) return <LoadingState />

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load project dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { project, presales, functional, technical, tasks, milestones, hypercare, governance } = data

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
            <ProjectHealthBadge health={project.health} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{project.projectCode} &middot; {project.customer} &middot; Phase: {project.currentPhase}</p>
        </div>
        <Link
          href={`/projects/${project.id}/overview`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Open Workspace
        </Link>
      </div>

      {/* Breadcrumb nav */}
      <div className="flex gap-2">
        <Link href="/dashboard/executive" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Executive Dashboard
        </Link>
      </div>

      {/* Task & Milestone Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Task Completion</h2>
          <div className="flex gap-4">
            <KpiCard label="Total Tasks" value={tasks.total} color="blue" />
            <KpiCard label="Done" value={tasks.done} color="green" />
          </div>
          <ProgressBar
            value={tasks.completionRate}
            label="Completion Rate"
            color={tasks.completionRate >= 80 ? 'bg-green-500' : tasks.completionRate >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Milestone Completion</h2>
          <div className="flex gap-4">
            <KpiCard label="Total Milestones" value={milestones.total} color="blue" />
            <KpiCard label="Completed" value={milestones.completed} color="green" />
          </div>
          <ProgressBar
            value={milestones.completionRate}
            label="Completion Rate"
            color={milestones.completionRate >= 80 ? 'bg-green-500' : milestones.completionRate >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}
          />
        </div>
      </div>

      {/* Presales KPIs */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Presales</h2>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Requirements" value={presales.requirementsCount} color="blue" />
          <KpiCard label="Pain Points" value={presales.painPointsCount} color="yellow" />
          <KpiCard label="AI Outputs" value={presales.aiOutputsCount} color="gray" />
        </div>
      </div>

      {/* Functional KPIs */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Functional Delivery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Processes" value={functional.processCount} color="blue" />
          <KpiCard label="Fit-Gap Coverage" value={`${functional.fitGapCoverage}%`} color={functional.fitGapCoverage >= 80 ? 'green' : functional.fitGapCoverage >= 50 ? 'yellow' : 'red'} />
          <KpiCard label="UAT Pass Rate" value={`${functional.uatPassRate}%`} color={functional.uatPassRate >= 80 ? 'green' : functional.uatPassRate >= 60 ? 'yellow' : 'red'} />
          <KpiCard label="SOPs" value={functional.sopCount} color="gray" />
        </div>
      </div>

      {/* Technical KPIs */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Technical Delivery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Integrations" value={technical.integrationCount} color="blue" />
          <KpiCard label="RESTlets" value={technical.restletCount} color="blue" />
          <KpiCard label="API Contracts" value={technical.apiContractCount} color="gray" />
          <KpiCard label="Payload Validations" value={technical.payloadCount} color="gray" />
        </div>
      </div>

      {/* Hypercare Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Hypercare</h2>

        {hypercare.criticalIssues > 0 && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              {hypercare.criticalIssues} critical issue{hypercare.criticalIssues !== 1 ? 's' : ''} require immediate attention
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Open Issues"
            value={hypercare.openIssues}
            color={hypercare.openIssues > 0 ? 'red' : 'green'}
          />
          <KpiCard
            label="Pending CRs"
            value={hypercare.pendingChangeRequests}
            color={hypercare.pendingChangeRequests > 0 ? 'yellow' : 'green'}
          />
          <KpiCard label="Tasks Done" value={`${hypercare.taskCompletion}%`} color="blue" />
          <KpiCard label="Go-Live Readiness" value={`${hypercare.goLiveReadiness}%`} color={hypercare.goLiveReadiness >= 80 ? 'green' : hypercare.goLiveReadiness >= 50 ? 'yellow' : 'red'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProgressBar
            value={hypercare.goLiveReadiness}
            label="Go-Live Readiness"
            color={hypercare.goLiveReadiness >= 80 ? 'bg-green-500' : hypercare.goLiveReadiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'}
          />
          <ProgressBar
            value={hypercare.taskCompletion}
            label="Task Completion"
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* KPI Trend Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Task Completion Trend (14d)</h2>
          {taskTrend.length > 0 ? (
            <MiniBarChart
              height={90}
              bars={taskTrend.slice(-10).map((pt, i) => ({
                label: `D${i + 1}`,
                value: Math.round(typeof pt.metricValue === 'number' ? pt.metricValue : 0),
                color: '#3b82f6',
              }))}
            />
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No trend data available yet</p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Open Issues Trend (14d)</h2>
          {issueTrend.length > 0 ? (
            <MiniBarChart
              height={90}
              bars={issueTrend.slice(-10).map((pt, i) => ({
                label: `D${i + 1}`,
                value: Math.round(typeof pt.metricValue === 'number' ? pt.metricValue : 0),
                color: '#ef4444',
              }))}
            />
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No trend data available yet</p>
          )}
        </div>
      </div>

      {/* Governance Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">AI Governance</h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* RAG Donut */}
          <div className="flex items-center gap-4">
            <DonutChart
              segments={[
                { label: 'Green', value: governance.ragGreen, color: '#22c55e' },
                { label: 'Amber', value: governance.ragAmber, color: '#f59e0b' },
                { label: 'Red', value: governance.ragRed, color: '#ef4444' },
              ]}
              size={100}
              thickness={18}
            />
            <div className="space-y-1.5 text-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">RAG Distribution</p>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /><span className="text-gray-600">Green: <strong>{governance.ragGreen}</strong></span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" /><span className="text-gray-600">Amber: <strong>{governance.ragAmber}</strong></span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /><span className="text-gray-600">Red: <strong>{governance.ragRed}</strong></span></div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-6 pt-4 sm:pt-0">
            <RagBar green={governance.ragGreen} amber={governance.ragAmber} red={governance.ragRed} />
            <div className="flex gap-6 pt-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">Hallucinations: </span>
                <span className={`font-semibold ${governance.hallucinationCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {governance.hallucinationCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Validation Pass: </span>
                <span className={`font-semibold ${governance.validationPassRate >= 80 ? 'text-green-600' : governance.validationPassRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {governance.validationPassRate}%
                </span>
              </div>
            </div>
            <div className="pt-1">
              <Link href={`/projects/${project.id}/governance`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View full governance dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
