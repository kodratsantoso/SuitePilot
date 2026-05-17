'use client'

interface Props {
  value: number
  label?: string
  color?: string
  showPct?: boolean
}

export function ProgressBar({ value, label, color = 'bg-blue-500', showPct = true }: Props) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div>
      {(label || showPct) && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          {label && <span>{label}</span>}
          {showPct && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-2 ${color} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
