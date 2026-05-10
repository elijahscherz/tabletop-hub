import { useId } from 'react'
import { Bar, Cell } from 'recharts'

type NeonBarProps<T> = {
  data: T[]
  dataKey: string
  gradientPair?: [string, string]
  palette: string[]
  radius: [number, number, number, number]
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

export function NeonBar<T extends { label?: string }>({ data, dataKey, gradientPair, palette, radius }: NeonBarProps<T>) {
  const id = useId().replaceAll(':', '')
  const glowFilterId = `${id}-glow`

  return (
    <>
      <defs>
        <filter height="200%" id={glowFilterId} width="200%" x="-50%" y="-50%">
          <feGaussianBlur result="blur" stdDeviation="4" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {palette.map((color, index) => {
          const gradientId = `${id}-bar-${index}`
          const topColor = gradientPair?.[0] ?? color
          const bottomColor = gradientPair?.[1] ?? color
          return (
            <linearGradient id={gradientId} key={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={toRgba(topColor, 0.98)} />
              <stop offset="55%" stopColor={toRgba(topColor, 0.82)} />
              <stop offset="100%" stopColor={toRgba(bottomColor, 0.46)} />
            </linearGradient>
          )
        })}
      </defs>
      <Bar dataKey={dataKey} filter={`url(#${glowFilterId})`} radius={radius}>
        {data.map((entry, index) => {
          const color = palette[index % palette.length] ?? '#8b5cf6'
          const gradientId = `${id}-bar-${index % palette.length}`
          const strokeColor = gradientPair?.[1] ?? color
          return <Cell fill={`url(#${gradientId})`} key={entry.label ?? `${dataKey}-${index}`} stroke={toRgba(strokeColor, 0.78)} strokeWidth={1.2} />
        })}
      </Bar>
    </>
  )
}
