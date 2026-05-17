'use client'

import Link from 'next/link'
import { usePortfolioSummary } from '@/hooks/useDashboard'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { RagBar } from '@/components/dashboard/RagBar'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectHealthBadge } from '@/components/projects/ProjectHealthBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ExecutiveDashboardPage() {
  const { data, isLoading, error } = usePortfolioSummary()

  if (isLoading) return <LoadingState />

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load portfolio summary: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { totals, projectSummaries, ragDistribution, validationDistribution } = data
  const activeProjects = projectSummaries.filter(p => p.status === 'ACTIVE')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Organization Portfolio Overview</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2">
        <Link href="/projects" className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100">
          Projects
        </Link>
        <Link href="/dashboard/executive" className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white">
          Executive Dashboard
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Total Projects" value={totals.totalProjects} color="blue" />
        <KpiCard label="Active" value={totals.activeProjects} color="green" />
        <KpiCard label="Completed" value={totals.completedProjects} color="gray" />
        <KpiCard label="At Risk" value={totals.atRiskProjects} color="red" />
        <KpiCard label="On Hold" value={totals.onHoldProjects} color="yellow" />
        <KpiCard label="Draft" value={totals.draftProjects} color="gray" />
      </div>

      {/* AI Governance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* RAG Status Donut */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">AI Output RAG Status</h2>
          <div className="flex items-center gap-6">
            <DonutChart
              segments={[
                { label: 'Green', value: ragDistribution.green, color: '#22c55e' },
                { label: 'Amber', value: ragDistribution.amber, color: '#f59e0b' },
                { label: 'Red', value: ragDistribution.red, color: '#ef4444' },
              ]}
              size={110}
              thickness={20}
            />
            <div className="space-y-2 text-sm flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /><span className="text-gray-600">Green</span></div>
                <span className="font-semibold text-gray-900">{ragDistribution.green}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><span className="text-gray-600">Amber</span></div>
                <span className="font-semibold text-gray-900">{ragDistribution.amber}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="text-gray-600">Red</span></div>
                <span className="font-semibold text-gray-900">{ragDistribution.red}</span>
              </div>
            </div>
          </div>
          <RagBar green={ragDistribution.green} amber={ragDistribution.amber} red={ragDistribution.red} />
        </div>

        {/* Validation Distribution Donut */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Output Validation</h2>
          <div className="flex items-center gap-6">
            <DonutChart
              segments={[
                { label: 'Pass', value: validationDistribution.pass, color: '#22c55e' },
                { label: 'Warning', value: validationDistribution.warning, color: '#f59e0b' },
                { label: 'Fail', value: validationDistribution.fail, color: '#ef4444' },
              ]}
              size={110}
              thickness={20}
            />
            <div className="space-y-2 text-sm flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /><span className="text-gray-600">Pass</span></div>
                <span className="font-semibold text-gray-900">{validationDistribution.pass}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><span className="text-gray-600">Warning</span></div>
                <span className="font-semibold text-gray-900">{validationDistribution.warning}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="text-gray-600">Fail</span></div>
                <span className="font-semibold text-gray-900">{validationDistribution.fail}</span>
              </div>
            </div>
          </div>
          {validationDistribution.pass + validationDistribution.warning + validationDistribution.fail > 0 && (
            <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
              Pass rate:{' '}
              <span className="font-semibold text-green-700">
                {Math.round((validationDistribution.pass / (validationDistribution.pass + validationDistribution.warning + validationDistribution.fail)) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Project Portfolio Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Project Portfolio</h2>
        </div>
        {projectSummaries.length === 0 ? (
          <div className="px-6 py-12">
            <EmptyState title="No projects" description="No projects found in this portfolio." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Health</th>
                  <th className="px-4 py-3 w-40">Progress</th>
                  <th className="px-4 py-3 text-right">Tasks</th>
                  <th className="px-4 py-3 text-right">Issues</th>
                  <th className="px-4 py-3">Dashboard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectSummaries.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/projects/${project.id}/overview`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {project.name}
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">{project.projectCode}</div>
                    </td>
                    <td className="px-4 py-4">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-4">
                      <ProjectHealthBadge health={project.health} />
                    </td>
                    <td className="px-4 py-4 w-40">
                      <ProgressBar value={project.progressPercentage} color={
                        project.progressPercentage >= 75 ? 'bg-green-500' :
                        project.progressPercentage >= 50 ? 'bg-blue-500' :
                        project.progressPercentage >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
                      } />
                    </td>
                    <td className="px-4 py-4 text-right text-gray-600">{project.taskCount}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={project.issueCount > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {project.issueCount}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/dashboard/project/${project.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Nav Cards for Active Projects */}
      {activeProjects.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Active Project Dashboards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{project.projectCode}</p>
                  </div>
                  <ProjectHealthBadge health={project.health} />
                </div>
                <ProgressBar value={project.progressPercentage} />
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>{project.taskCount} tasks</span>
                  <span className={project.issueCount > 0 ? 'text-red-600 font-medium' : ''}>
                    {project.issueCount} issues
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
