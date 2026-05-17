type Segment = { label: string; value: number; color: string }

type DonutChartProps = {
  segments: Segment[]
  size?: number
  thickness?: number
}

export function DonutChart({ segments, size = 120, thickness = 22 }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const radius = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={thickness} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#9ca3af">
          0
        </text>
      </svg>
    )
  }

  let offset = 0
  const arcs = segments
    .filter(s => s.value > 0)
    .map(seg => {
      const fraction = seg.value / total
      const dash = fraction * circumference
      const arc = { dash, gap: circumference - dash, offset, color: seg.color, label: seg.label, value: seg.value }
      offset += dash
      return arc
    })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={thickness} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={thickness}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset}
          strokeLinecap="butt"
        />
      ))}
      {/* Center total — counter-rotate to keep text upright */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="600"
        fill="#111827"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        {total}
      </text>
    </svg>
  )
}
