'use client'

import { useState } from 'react'
import type { ProjectMilestone } from '@/types'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface MilestoneFormProps {
  milestone?: ProjectMilestone
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  loading?: boolean
  error?: string
}

function toDateInput(iso?: string | null): string {
  if (!iso) return ''
  return iso.split('T')[0] ?? ''
}

export function MilestoneForm({ milestone, onSubmit, onCancel, loading, error }: MilestoneFormProps) {
  const [form, setForm] = useState({
    name: milestone?.name ?? '',
    description: milestone?.description ?? '',
    status: milestone?.status ?? 'NOT_STARTED',
    targetDate: toDateInput(milestone?.targetDate),
    actualDate: toDateInput(milestone?.actualDate),
    completionPercentage: String(milestone?.completionPercentage ?? 0),
  })
  const [validationError, setValidationError] = useState('')

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (!form.name.trim()) { setValidationError('Name is required'); return }
    if (!form.targetDate) { setValidationError('Target date is required'); return }
    const pct = parseInt(form.completionPercentage, 10)
    if (isNaN(pct) || pct < 0 || pct > 100) { setValidationError('Completion % must be 0–100'); return }

    const data: Record<string, unknown> = {
      name: form.name.trim(),
      status: form.status,
      targetDate: new Date(form.targetDate).toISOString(),
      completionPercentage: pct,
    }
    if (form.description.trim()) data['description'] = form.description.trim()
    if (form.actualDate) data['actualDate'] = new Date(form.actualDate).toISOString()
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Name" required>
        <Input value={form.name} onChange={set('name')} placeholder="Milestone name" autoFocus />
      </FormField>

      <FormField label="Description">
        <Textarea value={form.description} onChange={set('description')} placeholder="What does this milestone represent?" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status">
          <Select value={form.status} onChange={set('status')}>
            {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Completion %" hint="0–100">
          <Input type="number" min={0} max={100} value={form.completionPercentage} onChange={set('completionPercentage')} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Target Date" required>
          <Input type="date" value={form.targetDate} onChange={set('targetDate')} />
        </FormField>
        <FormField label="Actual Date" hint="Set when completed">
          <Input type="date" value={form.actualDate} onChange={set('actualDate')} />
        </FormField>
      </div>

      {(validationError || error) && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{validationError || error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" loading={loading}>{milestone ? 'Save Changes' : 'Create Milestone'}</Button>
      </div>
    </form>
  )
}
