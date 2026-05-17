'use client'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}

export function KpiCard({ label, value, sub, color = 'blue' }: KpiCardProps) {
  const bg = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  }
  const text = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
    gray: 'text-gray-700',
  }
  return (
    <div className={`rounded-lg border p-4 ${bg[color]}`}>
      <div className={`text-2xl font-bold ${text[color]}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
