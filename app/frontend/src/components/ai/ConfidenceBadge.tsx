'use client'

interface Props {
  score?: number | null
  showLabel?: boolean
}

export function ConfidenceBadge({ score, showLabel = true }: Props) {
  if (score == null) return <span className="text-gray-400 text-xs">—</span>
  const pct = Math.round(score)
  let color = 'text-red-600 bg-red-50 border-red-200'
  let label = 'Low'
  if (pct >= 90) {
    color = 'text-emerald-700 bg-emerald-50 border-emerald-200'
    label = 'Very High'
  } else if (pct >= 70) {
    color = 'text-green-700 bg-green-50 border-green-200'
    label = 'High'
  } else if (pct >= 40) {
    color = 'text-yellow-700 bg-yellow-50 border-yellow-200'
    label = 'Medium'
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>
      <span>{pct}%</span>
      {showLabel && <span>· {label}</span>}
    </span>
  )
}
