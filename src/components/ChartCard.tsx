import type { ReactNode } from 'react'

type ChartCardProps = {
  children: ReactNode
  className?: string
  subtitle?: string
  title: string
}

export function ChartCard({ children, className, subtitle, title }: ChartCardProps) {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
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
