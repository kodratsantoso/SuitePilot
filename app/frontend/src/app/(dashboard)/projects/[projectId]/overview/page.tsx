'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import type { ProjectSummary } from '@/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectHealthBadge } from '@/components/projects/ProjectHealthBadge'
import { formatDate, formatPhase, formatProjectType } from '@/lib/utils'

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsApi
      .get(projectId)
      .then((r) => setProject(r.data))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return <LoadingState />
  if (!project) return null

  return (
    <div className="max-w-4xl">
      <PageHeader title="Project Overview" />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Identity card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project Identity</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Code" value={project.projectCode} />
            <Row label="Customer" value={project.customer.name} />
            <Row label="Type" value={formatProjectType(project.projectType)} />
            <Row label="Current Phase" value={formatPhase(project.currentPhase)} />
            <Row label="Start Date" value={formatDate(project.startDate)} />
            <Row label="Target Go-Live" value={formatDate(project.targetGoLiveDate)} />
          </div>
        </div>

        {/* Status card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Current Status</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <ProjectStatusBadge status={project.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Health</span>
              <ProjectHealthBadge health={project.health} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{project.progressPercentage}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Team Leads</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Project Manager" value={project.projectManager?.name ?? '—'} />
            <Row label="Functional Lead" value={project.functionalLead?.name ?? '—'} />
            <Row label="Technical Lead" value={project.technicalLead?.name ?? '—'} />
          </div>
        </div>

        {/* Stats card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Activity Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <StatChip label="Tasks" value={project._count.tasks} />
            <StatChip label="Milestones" value={project._count.milestones} />
            <StatChip
              label="Open Risks"
              value={project._count.raidItems}
              accent={project._count.raidItems > 0}
            />
            <StatChip label="Members" value={project._count.members} />
          </div>
        </div>
      </div>

      {project.description && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</h2>
          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{project.description}</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function StatChip({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-md bg-gray-50 p-3 text-center">
      <p className={`text-xl font-bold ${accent ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
