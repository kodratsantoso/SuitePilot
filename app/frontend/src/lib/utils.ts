import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatProjectType(type: string): string {
  const map: Record<string, string> = {
    NEW_IMPLEMENTATION: 'New Implementation',
    OPTIMIZATION: 'Optimization',
    INTEGRATION: 'Integration',
    SUPPORT: 'Support',
    UPGRADE: 'Upgrade',
    ASSESSMENT: 'Assessment',
  }
  return map[type] ?? type
}

export function formatPhase(phase: string): string {
  const map: Record<string, string> = {
    PRESALES: 'Presales',
    DISCOVERY: 'Discovery',
    DESIGN: 'Design',
    BUILD: 'Build',
    UAT: 'UAT',
    CUTOVER: 'Cutover',
    HYPERCARE: 'Hypercare',
    CLOSED: 'Closed',
  }
  return map[phase] ?? phase
}
