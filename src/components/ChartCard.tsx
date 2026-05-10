import type { ReactNode } from 'react'

type ChartCardProps = {
  children: ReactNode
  className?: string
  subtitle?: string
  title?: string
}

export function ChartCard({ children, className, subtitle, title }: ChartCardProps) {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
      {title || subtitle ? (
        <div className="panel-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  )
}
