import { useId } from 'react'
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import type { CountDatum } from '../types'

type NeonRadialBarProps = {
  data: CountDatum[]
  palette: string[]
}

function hexToRgb(color: string) {
  const normalized = color.replace('#', '')
  const value = normalized.length === 3 ? normalized.split('').map((part) => `${part}${part}`).join('') : normalized
  const parsed = Number.parseInt(value, 16)

  return {
    b: parsed & 255,
    g: (parsed >> 8) & 255,
    r: (parsed >> 16) & 255,
  }
}

function toRgba(color: string, alpha: number) {
  const { r, g, b } = hexToRgb(color)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function NeonRadialBar({ data, palette }: NeonRadialBarProps) {
  const id = useId().replaceAll(':', '')
  const glowFilterId = `${id}-glow`
  const chartData = data.map((entry, index) => ({ ...entry, fill: `url(#${id}-radial-${index % palette.length})` }))

  return (
    <ResponsiveContainer>
      <RadialBarChart barSize={12} cx="50%" cy="50%" data={chartData} endAngle={-270} innerRadius="42%" outerRadius="82%" startAngle={90}>
        <defs>
          <filter height="200%" id={glowFilterId} width="200%" x="-50%" y="-50%">
            <feGaussianBlur result="blur" stdDeviation="4" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {palette.map((color, index) => {
            const gradientId = `${id}-radial-${index}`
            return (
              <linearGradient id={gradientId} key={gradientId} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor={toRgba(color, 0.98)} />
                <stop offset="55%" stopColor={toRgba(color, 0.82)} />
                <stop offset="100%" stopColor={toRgba(color, 0.46)} />
              </linearGradient>
            )
          })}
        </defs>
        <PolarAngleAxis dataKey="value" domain={[0, data[0]?.value ?? 1]} tick={false} type="number" />
        <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Player: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Plays' }} />} />
        <RadialBar background={{ fill: 'rgba(255, 255, 255, 0.04)' }} cornerRadius={10} dataKey="value" filter={`url(#${glowFilterId})`} label={{ fill: '#e5e7eb', position: 'insideStart' }} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
