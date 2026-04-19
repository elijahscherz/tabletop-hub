import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarHeatmap } from '../components/CalendarHeatmap'
import { ChartCard } from '../components/ChartCard'
import { HeatmapGrid } from '../components/HeatmapGrid'
import type { DashboardMetrics } from '../types'

type OverviewPageProps = {
  metrics: DashboardMetrics
}

const palette = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#38bdf8', '#f97316']

export function OverviewPage({ metrics }: OverviewPageProps) {
  return (
    <div className="page-grid">
      <section className="hero-band full-width">
        <div>
          <p className="eyebrow">Control room</p>
          <h3>Play history at a glance</h3>
          <p>
            Treating your board game life like a product reveals the same things a PM wants: growth, retention,
            concentration risk, and who your most important users actually are.
          </p>
        </div>
        <div className="hero-orbs" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="stats-grid full-width">
        {metrics.keyStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <ChartCard subtitle="Monthly play history across the current filter slice." title="Plays Over Time">
        <div className="chart-wrap tall">
          <ResponsiveContainer>
            <AreaChart data={metrics.monthlyActivity}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" hide />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip />
              <Area dataKey="value" fill="url(#overviewGlow)" stroke="#a855f7" strokeWidth={3} type="monotone" />
              <defs>
                <linearGradient id="overviewGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.08} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="A seasonal intensity map makes spikes and slumps obvious immediately." title="Year-Month Heatmap">
        <HeatmapGrid rows={metrics.monthlyHeatmap} />
      </ChartCard>

      <ChartCard subtitle="The day-level view shows true streaks, dead zones, and bursts that monthly charts smooth over." title="Calendar Heatmap">
        <CalendarHeatmap years={metrics.calendarHeatmap} />
      </ChartCard>

      <ChartCard subtitle="Portfolio mix of where sessions happen most often." title="Venue Share">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={metrics.venueShare}
                dataKey="value"
                innerRadius={60}
                nameKey="label"
                outerRadius={100}
                paddingAngle={4}
              >
                {metrics.venueShare.map((entry, index) => (
                  <Cell fill={palette[index % palette.length]} key={entry.label} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="The highest-repeat titles in the current filters." title="Top Games">
        <div className="leaderboard-list">
          {metrics.topGames.map((game, index) => (
            <div className="leaderboard-row" key={game.label}>
              <span className="rank-chip">{index + 1}</span>
              <span>{game.label}</span>
              <strong>{game.value}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="Where the table has been hottest." title="Top Locations">
        <div className="leaderboard-list">
          {metrics.topLocations.map((location, index) => (
            <div className="leaderboard-row" key={location.label}>
              <span className="rank-chip">{index + 1}</span>
              <span>{location.label}</span>
              <strong>{location.value}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="A healthy dashboard asks whether activity and title diversity are rising together." title="Yearly Diversity">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <AreaChart data={metrics.yearlyDiversity}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Area dataKey="plays" fill="#8b5cf633" name="Plays" stroke="#8b5cf6" type="monotone" />
              <Area dataKey="uniqueGames" fill="#22c55e22" name="Unique games" stroke="#22c55e" type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Fast takeaways surfaced from the current slice." title="Interesting Facts">
        <div className="facts-list">
          {metrics.interestingFacts.map((fact) => (
            <article className="fact-card" key={fact}>
              {fact}
            </article>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="At-a-glance social rhythm from the overview page." title="Social Highlights">
        <div className="pairing-list">
          {metrics.pairings.slice(0, 6).map((pairing) => (
            <article className="pairing-card" key={`${pairing.playerA}-${pairing.playerB}`}>
              <p>
                {pairing.playerA} + {pairing.playerB}
              </p>
              <strong>{pairing.value} plays together</strong>
            </article>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
