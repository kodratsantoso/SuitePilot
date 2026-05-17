type Bar = { label: string; value: number; color: string }

type MiniBarChartProps = {
  bars: Bar[]
  height?: number
  showValues?: boolean
}

export function MiniBarChart({ bars, height = 80, showValues = true }: MiniBarChartProps) {
  const max = Math.max(...bars.map(b => b.value), 1)

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {bars.map((bar, i) => {
        const barH = Math.max((bar.value / max) * (height - 24), bar.value > 0 ? 4 : 0)
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            {showValues && (
              <span className="text-xs font-semibold text-gray-700" style={{ minHeight: 16 }}>
                {bar.value > 0 ? bar.value : ''}
              </span>
            )}
            <div className="w-full rounded-t" style={{ height: barH, backgroundColor: bar.color, minHeight: bar.value > 0 ? 4 : 0 }} />
            <span className="text-[10px] text-gray-500 text-center leading-tight w-full truncate">
              {bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
