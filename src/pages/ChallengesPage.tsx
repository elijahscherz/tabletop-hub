import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import type { DashboardMetrics } from '../types'

type ChallengesPageProps = {
  metrics: DashboardMetrics
}

export function ChallengesPage({ metrics }: ChallengesPageProps) {
  return (
    <div className="page-grid">
      <ChartCard subtitle="A quick scan of which challenge arcs actually accumulated momentum." title="Challenge Momentum">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <BarChart data={metrics.challengeInsights.slice(0, 10)} layout="vertical" margin={{ left: 18 }}>
              <CartesianGrid stroke="#2d244a" horizontal={false} />
              <XAxis allowDecimals={false} stroke="#9ca3af" type="number" />
              <YAxis dataKey="name" stroke="#9ca3af" type="category" width={150} />
              <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Challenge: ${String(payload?.name ?? 'Unknown')}`} seriesLabels={{ progress: 'Logged plays' }} />} />
              <Bar dataKey="progress" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Challenges are counted against the current filter slice and their own date windows." title="Challenge Progress">
        <div className="challenge-grid">
          {metrics.challengeInsights.map((challenge) => {
            const completion = Math.min(challenge.completionRatio * 100, 100)

            return (
              <article className="challenge-card" key={challenge.name}>
                <div>
                  <p className="eyebrow">{challenge.status}</p>
                  <h3>{challenge.name}</h3>
                  <span>
                    {challenge.startDate} to {challenge.endDate}
                  </span>
                </div>
                <div className="progress-rail">
                  <div className="progress-fill" style={{ width: `${completion}%` }} />
                </div>
                <strong>
                  {challenge.progress} / {challenge.target || 'tracked'}
                </strong>
                <p className="challenge-percent">{completion.toFixed(0)}% complete</p>
              </article>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}
