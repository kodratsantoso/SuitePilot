'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import type { ProjectSummary } from '@/types'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState, SkeletonRow } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

type FilterStatus = '' | 'ACTIVE' | 'PLANNED' | 'ON_HOLD' | 'AT_RISK' | 'COMPLETED'
type FilterHealth = '' | 'GREEN' | 'AMBER' | 'RED'

export default function ProjectPortfolioPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('')
  const [healthFilter, setHealthFilter] = useState<FilterHealth>('')
  const [total, setTotal] = useState(0)

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (search) params['search'] = search
      if (statusFilter) params['status'] = statusFilter
      if (healthFilter) params['health'] = healthFilter

      const res = await projectsApi.list(params)
      setProjects(res.data ?? [])
      setTotal(res.meta?.total ?? (res.data?.length ?? 0))
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        router.push('/login')
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadProjects, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search, statusFilter, healthFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <PageHeader
        title="Project Portfolio"
        description={loading ? '' : `${total} project${total !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => router.push('/projects/new')}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            + New Project
          </button>
        }
      />

      {/* Navigation tabs */}
      <div className="flex gap-2 mb-4">
        <Link href="/projects" className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white">Projects</Link>
        <Link href="/dashboard/executive" className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100">Executive Dashboard</Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="AT_RISK">At Risk</option>
          <option value="DELAYED">Delayed</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value as FilterHealth)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Health</option>
          <option value="GREEN">Green</option>
          <option value="AMBER">Amber</option>
          <option value="RED">Red</option>
          <option value="UNKNOWN">Unknown</option>
        </select>

        {(search || statusFilter || healthFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setHealthFilter('') }}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <ErrorState message={error} retry={loadProjects} />
        )}

        {!loading && !error && projects.length === 0 && (
          <EmptyState
            title="No projects found"
            description={
              search || statusFilter || healthFilter
                ? 'No projects match your current filters. Try adjusting or clearing them.'
                : 'Get started by creating your first project.'
            }
            action={
              !search && !statusFilter && !healthFilter ? (
                <button
                  onClick={() => router.push('/projects/new')}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Create first project
                </button>
              ) : undefined
            }
          />
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
