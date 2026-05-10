import { useId } from 'react'
import { Cell, Pie } from 'recharts'
import type { CountDatum } from '../types'

type NeonPieProps = {
  data: CountDatum[]
  dataKey?: string
  innerRadius: number
  nameKey?: string
  outerRadius: number
  paddingAngle?: number
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

export function NeonPie({ data, dataKey = 'value', innerRadius, nameKey = 'label', outerRadius, paddingAngle = 3, palette }: NeonPieProps) {
  const id = useId().replaceAll(':', '')
  const glowFilterId = `${id}-glow`

  return (
    <>
      <defs>
        <filter height="200%" id={glowFilterId} width="200%" x="-50%" y="-50%">
          <feGaussianBlur result="blur" stdDeviation="5" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {palette.map((color, index) => {
          const gradientId = `${id}-slice-${index}`
          return (
            <radialGradient cx="35%" cy="30%" id={gradientId} key={gradientId} r="85%">
              <stop offset="0%" stopColor={toRgba(color, 0.98)} />
              <stop offset="55%" stopColor={toRgba(color, 0.88)} />
              <stop offset="100%" stopColor={toRgba(color, 0.58)} />
            </radialGradient>
          )
        })}
      </defs>
      <Pie cornerRadius={8} data={data} dataKey={dataKey} innerRadius={innerRadius} nameKey={nameKey} outerRadius={outerRadius} paddingAngle={paddingAngle} stroke="rgba(255, 255, 255, 0.12)" strokeWidth={1.25}>
        {data.map((entry, index) => {
          const color = palette[index % palette.length] ?? '#8b5cf6'
          const gradientId = `${id}-slice-${index % palette.length}`

          return (
            <Cell
              fill={`url(#${gradientId})`}
              filter={`url(#${glowFilterId})`}
              key={entry.label}
              stroke={toRgba(color, 0.8)}
              strokeWidth={1.4}
            />
          )
        })}
      </Pie>
    </>
  )
}
