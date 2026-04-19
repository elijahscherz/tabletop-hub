import type { ReactNode } from 'react'

type ChartCardProps = {
  children: ReactNode
  subtitle?: string
  title: string
}

export function ChartCard({ children, subtitle, title }: ChartCardProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}
