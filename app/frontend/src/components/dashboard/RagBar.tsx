'use client'

interface Props {
  green: number
  amber: number
  red: number
}

export function RagBar({ green, amber, red }: Props) {
  const total = green + amber + red
  if (total === 0) return <div className="h-3 bg-gray-100 rounded-full" />
  const gp = Math.round((green / total) * 100)
  const ap = Math.round((amber / total) * 100)
  const rp = 100 - gp - ap
  return (
    <div className="flex h-3 rounded-full overflow-hidden gap-px">
      {gp > 0 && <div className="bg-green-500" style={{ width: `${gp}%` }} />}
      {ap > 0 && <div className="bg-yellow-400" style={{ width: `${ap}%` }} />}
      {rp > 0 && <div className="bg-red-500" style={{ width: `${rp}%` }} />}
    </div>
  )
}
