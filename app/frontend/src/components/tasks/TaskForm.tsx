'use client'

import { useState } from 'react'
import type { ProjectTask } from '@/types'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface TaskFormData {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  startDate: string
}

interface TaskFormProps {
  task?: ProjectTask
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  loading?: boolean
  error?: string
}

function toDateInput(iso?: string | null): string {
  if (!iso) return ''
  return iso.split('T')[0] ?? ''
}

export function TaskForm({ task, onSubmit, onCancel, loading, error }: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'BACKLOG',
    priority: task?.priority ?? 'MEDIUM',
    dueDate: toDateInput(task?.dueDate),
    startDate: toDateInput(task?.startDate),
  })
  const [validationError, setValidationError] = useState('')

  const set = (k: keyof TaskFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (!form.title.trim()) {
      setValidationError('Title is required')
      return
    }
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) {
      setValidationError('Due date cannot be before start date')
      return
    }
    const data: Record<string, unknown> = {
      title: form.title.trim(),
      status: form.status,
      priority: form.priority,
    }
    if (form.description.trim()) data['description'] = form.description.trim()
    if (form.startDate) data['startDate'] = new Date(form.startDate).toISOString()
    if (form.dueDate) data['dueDate'] = new Date(form.dueDate).toISOString()
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Title" required>
        <Input
          value={form.title}
          onChange={set('title')}
          placeholder="What needs to be done?"
          autoFocus
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          value={form.description}
          onChange={set('description')}
          placeholder="Additional details..."
          rows={3}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status">
          <Select value={form.status} onChange={set('status')}>
            {['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Priority">
          <Select value={form.priority} onChange={set('priority')}>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date">
          <Input type="date" value={form.startDate} onChange={set('startDate')} />
        </FormField>
        <FormField label="Due Date">
          <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
        </FormField>
      </div>

      {(validationError || error) && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {validationError || error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
