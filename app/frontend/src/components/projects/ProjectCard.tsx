import Link from 'next/link'
import type { ProjectSummary } from '@/types'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { ProjectHealthBadge } from './ProjectHealthBadge'
import { formatDate, formatProjectType, formatPhase } from '@/lib/utils'

interface ProjectCardProps {
  project: ProjectSummary
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}/overview`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-400">{project.projectCode}</p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-500">{project.customer.name}</p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <ProjectStatusBadge status={project.status} />
          <ProjectHealthBadge health={project.health} />
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>{formatProjectType(project.projectType)}</span>
        <span>Phase: {formatPhase(project.currentPhase)}</span>
        {project.targetGoLiveDate && (
          <span>Go-live: {formatDate(project.targetGoLiveDate)}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{project.progressPercentage}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${project.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {project.projectManager && (
            <span>PM: {project.projectManager.name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {project._count.raidItems > 0 && (
            <span className="font-medium text-orange-600">{project._count.raidItems} risk{project._count.raidItems !== 1 ? 's' : ''}</span>
          )}
          <span>{project._count.tasks} tasks</span>
        </div>
      </div>
    </Link>
  )
}
