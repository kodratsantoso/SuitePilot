import { cn } from '@/lib/utils'
import type { AiOutputType } from '@/types'

const typeConfig: Record<AiOutputType, { label: string; className: string }> = {
  DISCOVERY_SUMMARY: { label: 'Discovery Summary', className: 'bg-blue-100 text-blue-700' },
  REQUIREMENT_ANALYSIS: { label: 'Requirement Analysis', className: 'bg-indigo-100 text-indigo-700' },
  PAIN_POINT_ANALYSIS: { label: 'Pain Point Analysis', className: 'bg-orange-100 text-orange-700' },
  MODULE_RECOMMENDATION: { label: 'Module Recommendation', className: 'bg-cyan-100 text-cyan-700' },
  SCOPE_DRAFT: { label: 'Scope Draft', className: 'bg-teal-100 text-teal-700' },
  PROPOSAL_DRAFT: { label: 'Proposal Draft', className: 'bg-violet-100 text-violet-700' },
  BRD_DRAFT: { label: 'BRD Draft', className: 'bg-purple-100 text-purple-700' },
  FIT_GAP_DRAFT: { label: 'Fit-Gap Draft', className: 'bg-pink-100 text-pink-700' },
  RISK_SUMMARY: { label: 'Risk Summary', className: 'bg-red-100 text-red-700' },
  MEETING_SUMMARY: { label: 'Meeting Summary', className: 'bg-gray-100 text-gray-700' },
}

export function AiOutputTypeBadge({
  outputType,
  className,
}: {
  outputType: AiOutputType
  className?: string
}) {
  const cfg = typeConfig[outputType] ?? { label: outputType, className: 'bg-gray-100 text-gray-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  )
}
