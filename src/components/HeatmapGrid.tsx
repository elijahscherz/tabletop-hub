import type { CSSProperties } from 'react'
import type { HeatmapRow } from '../types'

type HeatmapGridProps = {
  rows: HeatmapRow[]
}

export function HeatmapGrid({ rows }: HeatmapGridProps) {
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-months">
        <span />
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <div className="heatmap-grid">
        {rows.map((row) => (
          <div className="heatmap-row" key={row.label}>
            <span className="heatmap-label">{row.label}</span>
            {row.cells.map((cell) => (
              <div
                className="heatmap-cell"
                key={cell.label}
                style={
                  {
                    background: `linear-gradient(135deg, rgba(56, 189, 248, ${0.14 + cell.intensity / 180}), rgba(236, 72, 153, ${0.08 + cell.intensity / 120}))`,
                    boxShadow:
                      cell.count > 0 ? `inset 0 0 18px rgba(255,255,255,0.05), 0 0 22px rgba(168, 85, 247, ${cell.intensity / 240})` : undefined,
                    opacity: cell.count > 0 ? 1 : 0.32,
                  } as CSSProperties
                }
                title={`${cell.label}: ${cell.count} plays`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
