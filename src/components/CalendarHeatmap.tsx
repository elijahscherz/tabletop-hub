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

function getCalendarCellStyle(day: CalendarYear['days'][number]) {
  if (day.count === 0) {
    return {
      background: 'rgba(255, 255, 255, 0.015)',
      boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.015)',
      opacity: 0.06,
    }
  }

  const normalized = day.intensity / 100
  const presence = Math.sqrt(normalized)
  const glowStrength = normalized ** 2.2
  const peakBoost = normalized > 0.82 ? ((normalized - 0.82) / 0.18) ** 2 : 0

  return {
    background: `linear-gradient(135deg, rgba(56, 189, 248, ${0.42 + presence * 0.16 + glowStrength * 0.2 + peakBoost * 0.12}), rgba(236, 72, 153, ${0.28 + presence * 0.18 + glowStrength * 0.26 + peakBoost * 0.16}))`,
    borderColor: `rgba(255, 255, 255, ${0.08 + glowStrength * 0.16 + peakBoost * 0.12})`,
    boxShadow: `inset 0 0 ${8 + glowStrength * 8}px rgba(255, 255, 255, ${0.02 + glowStrength * 0.08}), 0 0 ${6 + glowStrength * 12 + peakBoost * 10}px rgba(56, 189, 248, ${0.08 + glowStrength * 0.12}), 0 0 ${10 + glowStrength * 18 + peakBoost * 14}px rgba(236, 72, 153, ${0.12 + glowStrength * 0.18 + peakBoost * 0.14})`,
    filter: `saturate(${1.02 + glowStrength * 0.85 + peakBoost * 0.3}) brightness(${1 + glowStrength * 0.22 + peakBoost * 0.08})`,
    opacity: 0.76 + presence * 0.1 + glowStrength * 0.14,
  }
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
                      style={getCalendarCellStyle(day)}
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
