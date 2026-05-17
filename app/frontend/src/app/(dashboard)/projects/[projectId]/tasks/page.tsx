'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import type { ProjectTask } from '@/types'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['', 'BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE']
const STATUS_LABELS: Record<string, string> = {
  '': 'All', BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked', IN_REVIEW: 'In Review', DONE: 'Done',
}

export default function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ProjectTask | undefined>()
  const [formError, setFormError] = useState('')

  const params = statusFilter ? { status: statusFilter } : undefined
  const { data: allTasks = [], isLoading, isError, refetch } = useTasks(projectId, params)
  const createTask = useCreateTask(projectId)
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)

  const tasks = search
    ? allTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : allTasks

  function openCreate() { setEditingTask(undefined); setFormError(''); setSheetOpen(true) }
  function openEdit(task: ProjectTask) { setEditingTask(task); setFormError(''); setSheetOpen(true) }
  function closeSheet() { setSheetOpen(false); setEditingTask(undefined) }

  async function handleSubmit(data: Record<string, unknown>) {
    setFormError('')
    try {
      if (editingTask) {
        await updateTask.mutateAsync({ taskId: editingTask.id, data })
      } else {
        await createTask.mutateAsync(data)
      }
      closeSheet()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteTask.mutateAsync(deleteTarget.id)
      setDeleteTarget(undefined)
    } catch { /* deletion errors are non-critical here */ }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={isLoading ? '' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        action={<Button onClick={openCreate} size="sm">+ New Task</Button>}
      />

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Table */}
      <div className="mt-4">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && tasks.length === 0 && (
          <EmptyState
            title={search || statusFilter ? 'No tasks match your filters' : 'No tasks yet'}
            description={search || statusFilter ? 'Try adjusting your search or filters.' : 'Create the first task for this project.'}
            action={!search && !statusFilter ? <Button onClick={openCreate} size="sm">Create first task</Button> : undefined}
          />
        )}
        {!isLoading && !isError && tasks.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Status', 'Priority', 'Owner', 'Due Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(task)} className="text-left hover:underline">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{task.description}</p>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{task.owner?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEdit(task)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Edit"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" d="M11 2l3 3-8 8H3v-3L11 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={closeSheet}
          loading={createTask.isPending || updateTask.isPending}
          error={formError}
        />
      </Sheet>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
        loading={deleteTask.isPending}
      />
    </div>
  )
}
