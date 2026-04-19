import { useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import type { HeatmapRow } from '../types'

type HeatmapGridProps = {
  rows: HeatmapRow[]
}

type HoveredMonthCell = {
  count: number
  intensity: number
  label: string
  x: number
  y: number
}

export function HeatmapGrid({ rows }: HeatmapGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredMonthCell | null>(null)

  function handleMouseEnter(cell: HeatmapRow['cells'][number], event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const parentBounds = containerRef.current?.getBoundingClientRect()

    if (!parentBounds) {
      return
    }

    setHoveredCell({
      count: cell.count,
      intensity: cell.intensity,
      label: cell.label,
      x: bounds.left - parentBounds.left + bounds.width / 2,
      y: bounds.top - parentBounds.top,
    })
  }

  return (
    <div className="heatmap-wrap" ref={containerRef}>
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
              <div className="heatmap-cell-frame" key={cell.label}>
                <div
                  className="heatmap-cell"
                  onMouseEnter={(event) => handleMouseEnter(cell, event)}
                  onMouseLeave={() => setHoveredCell((current) => (current?.label === cell.label ? null : current))}
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
              </div>
            ))}
          </div>
        ))}
      </div>
      {hoveredCell ? (
        <div className="chart-tooltip heatmap-overlay-tooltip" style={{ left: hoveredCell.x, top: hoveredCell.y }}>
          <p className="chart-tooltip-title">{hoveredCell.label}</p>
          <div className="chart-tooltip-body">
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">Plays</span>
              <strong>{hoveredCell.count}</strong>
            </div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">Heat level</span>
              <strong>{hoveredCell.intensity}%</strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
