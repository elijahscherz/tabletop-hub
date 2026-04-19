import type { CalendarYear } from '../types'

type CalendarHeatmapProps = {
  years: CalendarYear[]
}

export function CalendarHeatmap({ years }: CalendarHeatmapProps) {
  return (
    <div className="calendar-years">
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
                      style={{
                        background: `linear-gradient(180deg, rgba(34, 197, 94, ${0.08 + day.intensity / 180}), rgba(168, 85, 247, ${0.08 + day.intensity / 120}))`,
                        opacity: day.count > 0 ? 1 : 0.28,
                      }}
                    />
                    <div className="chart-tooltip calendar-popover">
                      <p className="chart-tooltip-title">{day.date}</p>
                      <div className="chart-tooltip-body">
                        <div className="chart-tooltip-row">
                          <span className="chart-tooltip-label">Plays</span>
                          <strong>{day.count}</strong>
                        </div>
                        <div className="chart-tooltip-row">
                          <span className="chart-tooltip-label">Heat level</span>
                          <strong>{day.intensity}%</strong>
                        </div>
                      </div>
                    </div>
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
    </div>
  )
}
