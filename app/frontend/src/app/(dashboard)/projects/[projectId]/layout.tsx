'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import type { ProjectSummary } from '@/types'
import { ProjectWorkspaceSidebar } from '@/components/workspace/ProjectWorkspaceSidebar'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectHealthBadge } from '@/components/projects/ProjectHealthBadge'
import { LoadingState } from '@/components/shared/LoadingState'

export default function ProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const projectId = params['projectId'] as string
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    projectsApi
      .get(projectId)
      .then((res) => setProject(res.data))
      .catch((err) => {
        if (err.message?.includes('401')) router.push('/login')
        else if (err.message?.includes('404')) router.push('/projects')
      })
      .finally(() => setLoading(false))
  }, [projectId, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState message="Loading project..." />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <ProjectWorkspaceSidebar
        projectId={project.id}
        projectName={project.name}
        projectCode={project.projectCode}
      />

      {/* Main workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Workspace header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm text-gray-400">{project.customer.name}</span>
            <span className="text-gray-300">/</span>
            <span className="truncate text-sm font-semibold text-gray-900">{project.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ProjectStatusBadge status={project.status} />
            <ProjectHealthBadge health={project.health} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
