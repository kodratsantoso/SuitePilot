'use client'

import { useState } from 'react'
import type { RaidItem } from '@/types'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface RaidFormProps {
  item?: RaidItem
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  loading?: boolean
  error?: string
}

function toDateInput(iso?: string | null): string {
  if (!iso) return ''
  return iso.split('T')[0] ?? ''
}

export function RaidForm({ item, onSubmit, onCancel, loading, error }: RaidFormProps) {
  const [form, setForm] = useState({
    type: item?.type ?? 'RISK',
    title: item?.title ?? '',
    description: item?.description ?? '',
    status: item?.status ?? 'OPEN',
    severity: item?.severity ?? '',
    probability: item?.probability ?? '',
    impact: item?.impact ?? '',
    mitigation: item?.mitigation ?? '',
    dueDate: toDateInput(item?.dueDate),
  })
  const [validationError, setValidationError] = useState('')

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (!form.type) { setValidationError('Type is required'); return }
    if (!form.title.trim()) { setValidationError('Title is required'); return }
    if (!form.description.trim()) { setValidationError('Description is required'); return }

    const data: Record<string, unknown> = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
    }
    if (form.severity) data['severity'] = form.severity
    if (form.probability) data['probability'] = form.probability
    if (form.impact) data['impact'] = form.impact
    if (form.mitigation.trim()) data['mitigation'] = form.mitigation.trim()
    if (form.dueDate) data['dueDate'] = new Date(form.dueDate).toISOString()
    onSubmit(data)
  }

  const severityOpts = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type" required>
          <Select value={form.type} onChange={set('type')}>
            {['RISK', 'ASSUMPTION', 'ISSUE', 'DEPENDENCY', 'DECISION'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={form.status} onChange={set('status')}>
            {['OPEN', 'MONITORING', 'MITIGATED', 'RESOLVED', 'CLOSED', 'ESCALATED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Title" required>
        <Input value={form.title} onChange={set('title')} placeholder="Brief description of this item" autoFocus />
      </FormField>

      <FormField label="Description" required>
        <Textarea value={form.description} onChange={set('description')} placeholder="Detailed description..." rows={3} />
      </FormField>

      {(form.type === 'RISK' || form.type === 'ISSUE') && (
        <div className="grid grid-cols-3 gap-3">
          {(['severity', 'probability', 'impact'] as const).map((field) => (
            <FormField key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
              <Select value={form[field]} onChange={set(field)}>
                {severityOpts.map((v) => <option key={v} value={v}>{v || '—'}</option>)}
              </Select>
            </FormField>
          ))}
        </div>
      )}

      <FormField label="Mitigation / Notes">
        <Textarea value={form.mitigation} onChange={set('mitigation')} placeholder="How is this being addressed?" rows={2} />
      </FormField>

      <FormField label="Due Date">
        <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
      </FormField>

      {(validationError || error) && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{validationError || error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" loading={loading}>{item ? 'Save Changes' : 'Create Item'}</Button>
      </div>
    </form>
  )
}
