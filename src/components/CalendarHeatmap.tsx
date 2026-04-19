import { useRef, useState, type MouseEvent } from 'react'
import type { CalendarYear } from '../types'

type CalendarHeatmapProps = {
  years: CalendarYear[]
}

type HoveredDay = {
  count: number
  date: string
  intensity: number
  x: number
  y: number
}

export function CalendarHeatmap({ years }: CalendarHeatmapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hoveredDay, setHoveredDay] = useState<HoveredDay | null>(null)

  function handleMouseEnter(day: CalendarYear['days'][number], event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const parentBounds = containerRef.current?.getBoundingClientRect()

    if (!parentBounds) {
      return
    }

    setHoveredDay({
      count: day.count,
      date: day.date,
      intensity: day.intensity,
      x: bounds.left - parentBounds.left + bounds.width / 2,
      y: bounds.top - parentBounds.top,
    })
  }

  return (
    <div className="calendar-years" ref={containerRef}>
      {years.map((year) => (
        <section className="calendar-year" key={year.label}>
          <div className="calendar-header">
            <h3>{year.label}</h3>
          </div>
          <div className="calendar-grid-wrap">
            <div className="calendar-weekdays">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <span key={`${year.label}-${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid-panel">
              <div className="calendar-grid">
                {year.days.map((day) => (
                  <div className="calendar-cell-frame" key={day.date} style={{ gridColumn: day.week + 1, gridRow: day.weekday + 1 }}>
                    <div
                      className="calendar-cell"
                      onMouseEnter={(event) => handleMouseEnter(day, event)}
                      onMouseLeave={() => setHoveredDay((current) => (current?.date === day.date ? null : current))}
                      style={{
                        background:
                          day.count > 0
                            ? `linear-gradient(180deg, rgba(34, 197, 94, ${0.1 + day.intensity / 120}), rgba(168, 85, 247, ${0.06 + day.intensity / 80}))`
                            : 'rgba(255, 255, 255, 0.03)',
                        boxShadow:
                          day.count > 0
                            ? `inset 0 0 10px rgba(255, 255, 255, 0.04), 0 0 ${8 + day.intensity / 6}px rgba(168, 85, 247, ${0.08 + day.intensity / 180})`
                            : 'inset 0 0 8px rgba(255, 255, 255, 0.02)',
                        opacity: day.count > 0 ? 0.45 + day.intensity / 180 : 0.16,
                      }}
                      title={`${day.date}: ${day.count} plays`}
                    />
                  </div>
                ))}
              </div>
              <div className="calendar-months" aria-hidden="true">
                {year.months.map((month) => (
                  <span key={`${year.label}-${month.label}`} style={{ gridColumn: month.week + 1 }}>
                    {month.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
      {hoveredDay ? (
        <div className="chart-tooltip calendar-overlay-tooltip" style={{ left: hoveredDay.x, top: hoveredDay.y }}>
          <p className="chart-tooltip-title">{hoveredDay.date}</p>
          <div className="chart-tooltip-body">
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">Plays</span>
              <strong>{hoveredDay.count}</strong>
            </div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">Heat level</span>
              <strong>{hoveredDay.intensity}%</strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
