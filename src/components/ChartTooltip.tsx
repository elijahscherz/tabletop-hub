type TooltipEntry = {
  color?: string
  dataKey?: string | number
  name?: string | number
  payload?: Record<string, unknown>
  value?: unknown
}

type ChartTooltipProps = {
  active?: boolean
  label?: string | number
  labelFormatter?: (label: string | number | undefined, payload?: Record<string, unknown>) => string | null
  labelTitle?: string
  payload?: TooltipEntry[]
  seriesLabels?: Record<string, string>
  valueFormatter?: (value: unknown, entry: TooltipEntry) => string
}

function prettifyLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
}

function defaultValueFormatter(value: unknown) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)
  }

  return String(value ?? '')
}

export function ChartTooltip({
  active,
  label,
  labelFormatter,
  labelTitle,
  payload,
  seriesLabels,
  valueFormatter = defaultValueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const source = payload[0]?.payload
  const heading = labelFormatter
    ? labelFormatter(label, source)
    : label !== undefined && label !== null
      ? labelTitle
        ? `${labelTitle}: ${label}`
        : String(label)
      : null

  return (
    <div className="chart-tooltip">
      {heading ? <p className="chart-tooltip-title">{heading}</p> : null}
      <div className="chart-tooltip-body">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? 'value')
          const displayName = seriesLabels?.[key] ?? seriesLabels?.[String(entry.name ?? '')] ?? prettifyLabel(key)

          return (
            <div className="chart-tooltip-row" key={`${key}-${displayName}`}>
              <div className="chart-tooltip-label">
                <span className="chart-tooltip-dot" style={{ backgroundColor: entry.color ?? '#a855f7' }} />
                <span>{displayName}</span>
              </div>
              <strong>{valueFormatter(entry.value, entry)}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
