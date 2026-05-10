import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarHeatmap } from '../components/CalendarHeatmap'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { HeatmapGrid } from '../components/HeatmapGrid'
import { NeonPie } from '../components/NeonPie'
import type { DashboardMetrics } from '../types'

type OverviewPageProps = {
  metrics: DashboardMetrics
}

const palette = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#38bdf8', '#f97316']

export function OverviewPage({ metrics }: OverviewPageProps) {
  return (
    <div className="page-grid">
      <section className="stats-grid full-width overview-stats-grid">
        {metrics.keyStats.map((stat) => (
          <article className="stat-card overview-stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <ChartCard className="full-width overview-timeline-card" subtitle="Monthly play history across the current filter slice." title="Plays Over Time">
        <div className="chart-wrap tall overview-timeline-wrap">
          <ResponsiveContainer>
            <AreaChart data={metrics.monthlyActivity} margin={{ bottom: 8, left: 4, right: 8, top: 8 }}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" minTickGap={28} stroke="#94a3b8" tickLine={false} />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Legend align="right" iconType="circle" verticalAlign="top" wrapperStyle={{ paddingBottom: '0.6rem' }} />
              <Tooltip content={<ChartTooltip labelTitle="Month" seriesLabels={{ value: 'Plays' }} />} />
              <Area dataKey="value" fill="url(#overviewGlow)" name="Plays" stroke="#a855f7" strokeWidth={3} type="monotone" />
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

      <ChartCard className="overview-wide-card overview-heatmap-card" subtitle="A seasonal intensity map makes spikes and slumps obvious immediately." title="Year-Month Heatmap">
        <HeatmapGrid rows={metrics.monthlyHeatmap} />
      </ChartCard>

      <ChartCard className="overview-side-card" subtitle="A quick read on how often you played and how wide the rotation stayed." title="Activity vs Variety">
        <div className="chart-wrap overview-side-chart">
          <ResponsiveContainer>
            <AreaChart data={metrics.yearlyDiversity}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip content={<ChartTooltip labelTitle="Year" seriesLabels={{ plays: 'Plays', uniqueGames: 'Unique games' }} />} />
              <Legend />
              <Area dataKey="plays" fill="#8b5cf633" name="Plays" stroke="#8b5cf6" type="monotone" />
              <Area dataKey="uniqueGames" fill="#22c55e22" name="Unique games" stroke="#22c55e" type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard className="overview-wide-card overview-calendar-card" subtitle="The day-level view shows true streaks, dead zones, and bursts that monthly charts smooth over." title="Calendar Heatmap">
        <CalendarHeatmap years={metrics.calendarHeatmap} />
      </ChartCard>

      <ChartCard className="overview-side-card" subtitle="Portfolio mix of where sessions happen most often." title="Venue Share">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <PieChart>
              <NeonPie
                data={metrics.venueShare}
                innerRadius={60}
                outerRadius={100}
                palette={palette}
                paddingAngle={4}
              />
              <Legend />
              <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Venue: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Sessions' }} />} />
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
