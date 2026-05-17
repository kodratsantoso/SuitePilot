'use client'

import { useState } from 'react'
import { useNetsuiteCatalog } from '@/hooks/useNetsuiteCatalog'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { NetsuiteModule } from '@/types'

function ModuleCard({ module: mod }: { module: NetsuiteModule }) {
  const [notesExpanded, setNotesExpanded] = useState(false)
  const hasDeps = mod.dependencies != null && (
    Array.isArray(mod.dependencies)
      ? (mod.dependencies as unknown[]).length > 0
      : Object.keys(mod.dependencies as Record<string, unknown>).length > 0
  )

  const depsList: string[] = hasDeps
    ? Array.isArray(mod.dependencies)
      ? (mod.dependencies as string[])
      : Object.values(mod.dependencies as Record<string, string>)
    : []

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-3">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{mod.moduleName}</h3>
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 flex-shrink-0">
            {mod.category}
          </span>
        </div>
        {mod.description && (
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{mod.description}</p>
        )}
      </div>

      {hasDeps && depsList.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Dependencies</p>
          <div className="flex flex-wrap gap-1">
            {depsList.map((dep, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {mod.implementationNotes && (
        <div>
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${notesExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Implementation Notes
          </button>
          {notesExpanded && (
            <p className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200 leading-relaxed">
              {mod.implementationNotes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ModuleCatalogPage() {
  const { data: modules = [], isLoading, error, refetch } = useNetsuiteCatalog()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get unique categories
  const categories = Array.from(new Set(modules.map((m) => m.category))).sort()

  // Filter
  const filtered = modules.filter((m) => {
    const matchesSearch =
      search === '' ||
      m.moduleName.toLowerCase().includes(search.toLowerCase()) ||
      (m.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group by category
  const grouped = filtered.reduce<Record<string, NetsuiteModule[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = []
    acc[m.category].push(m)
    return acc
  }, {})
  const groupedCategories = Object.keys(grouped).sort()

  return (
    <div>
      <PageHeader
        title="NetSuite Module Catalog"
        description="Browse all available NetSuite modules and their capabilities"
      />

      {/* Search and filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={(error as Error)?.message}
            retry={() => refetch()}
          />
        ) : modules.length === 0 ? (
          <EmptyState
            title="No modules in catalog"
            description="The NetSuite module catalog is currently empty."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No modules match your search"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <div className="space-y-8">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {modules.length} module{modules.length !== 1 ? 's' : ''}
            </p>
            {groupedCategories.map((category) => (
              <div key={category}>
                <h2 className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {grouped[category].length} module{grouped[category].length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[category].map((mod) => (
                    <ModuleCard key={mod.id} module={mod} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
