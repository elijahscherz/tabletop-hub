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
            <div className="calendar-grid">
              {year.days.map((day) => (
                <div
                  className="calendar-cell"
                  key={day.date}
                  style={{
                    background: `linear-gradient(180deg, rgba(34, 197, 94, ${0.08 + day.intensity / 180}), rgba(168, 85, 247, ${0.08 + day.intensity / 120}))`,
                    gridColumn: day.week + 1,
                    gridRow: day.weekday + 1,
                    opacity: day.count > 0 ? 1 : 0.28,
                  }}
                  title={`${day.date}: ${day.count} plays`}
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
