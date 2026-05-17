'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useHypercareTasks, useCreateHypercareTask, useUpdateHypercareTask, useDeleteHypercareTask } from '@/hooks/useHypercareTasks'
import { HypercareTaskStatusBadge } from '@/components/ai/HypercareTaskStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import type { HypercareTaskStatus, TaskPriority } from '@/types'

const STATUSES: HypercareTaskStatus[] = ['BACKLOG', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'ESCALATED']
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
}

export default function HypercareTasksPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: tasks = [], isLoading, isError, refetch } = useHypercareTasks(projectId)
  const createTask = useCreateHypercareTask(projectId)
  const updateTask = useUpdateHypercareTask(projectId)
  const deleteTask = useDeleteHypercareTask(projectId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<HypercareTaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'BACKLOG' as HypercareTaskStatus,
  })

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false
    if (priorityFilter && t.priority !== priorityFilter) return false
    return true
  })

  function resetForm() {
    setForm({ title: '', description: '', priority: 'MEDIUM', status: 'BACKLOG' })
    setFormError('')
  }

  async function handleCreate() {
    if (!form.title.trim()) { setFormError('Title is required'); return }
    try {
      await createTask.mutateAsync({ title: form.title.trim(), description: form.description || undefined, priority: form.priority, status: form.status })
      setSheetOpen(false)
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  async function handleStatusChange(taskId: string, status: HypercareTaskStatus) {
    await updateTask.mutateAsync({ taskId, data: { status } })
  }

  async function handleDelete(taskId: string) {
    await deleteTask.mutateAsync(taskId)
    setDeleteId(null)
  }

  if (isLoading) return <LoadingState message="Loading hypercare tasks..." />
  if (isError) return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
      Failed to load tasks. <button onClick={() => refetch()} className="underline">Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hypercare Tasks"
        description="Post-go-live support tasks and follow-up actions"
        action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Task</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as HypercareTaskStatus | '')}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {(statusFilter || priorityFilter) && (
          <button
            className="text-xs text-gray-400 hover:text-gray-600"
            onClick={() => { setStatusFilter(''); setPriorityFilter('') }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Add hypercare tasks to track post-go-live support work."
          action={<Button size="sm" onClick={() => setSheetOpen(true)}>Add Task</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div key={task.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <HypercareTaskStatusBadge status={task.status} />
                    <span className={`text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                    {task.owner && <span className="text-xs text-gray-400">{task.owner.name}</span>}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{task.title}</div>
                  {task.description && <div className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</div>}
                  {task.completedAt && (
                    <div className="mt-1 text-xs text-green-600">Completed {new Date(task.completedAt).toLocaleDateString()}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as HypercareTaskStatus)}
                    className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <button
                    onClick={() => setDeleteId(task.id)}
                    className="text-xs text-gray-300 hover:text-red-500"
                    title="Delete task"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" d="M3 4h10M6 4V3h4v1M5 4v8h6V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setSheetOpen(false); resetForm() }} />
          <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Hypercare Task</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as HypercareTaskStatus }))}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              {formError && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setSheetOpen(false); resetForm() }}>Cancel</Button>
              <Button size="sm" loading={createTask.isPending} onClick={handleCreate}>Create Task</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Delete Task</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this task? This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" size="sm" loading={deleteTask.isPending} onClick={() => handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
