import { useMemo, useState } from 'react'
import {
  BarChart,
  CartesianGrid,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { NeonBar } from '../components/NeonBar'
import { ChartTooltip } from '../components/ChartTooltip'
import { NeonPie } from '../components/NeonPie'
import { SocialSections } from './SocialPage'
import type { DashboardMetrics } from '../types'

type PlayersPageProps = {
  metrics: DashboardMetrics
}

const palette = ['#22c55e', '#8b5cf6', '#ec4899', '#38bdf8', '#f59e0b', '#f97316']

export function PlayersPage({ metrics }: PlayersPageProps) {
  const [selectedPlayer, setSelectedPlayer] = useState(metrics.playerInsights[0]?.playerName ?? '')

  const currentPlayer = useMemo(
    () => metrics.playerInsights.find((player) => player.playerName === selectedPlayer) ?? metrics.playerInsights[0],
    [metrics.playerInsights, selectedPlayer],
  )

  if (!currentPlayer) {
    return null
  }

  return (
    <div className="page-grid">
      <ChartCard className="full-width">
        <div className="player-selector-row">
          <div className="player-selector-card">
            <div>
              <p className="mini-heading">Selected player</p>
              <strong>{currentPlayer.playerName}</strong>
            </div>
            <label className="player-selector-field">
              <span>Switch focus</span>
              <select value={selectedPlayer} onChange={(event) => setSelectedPlayer(event.target.value)}>
                {metrics.playerInsights.map((player) => (
                  <option key={player.playerName} value={player.playerName}>
                    {player.playerName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="stats-grid compact">
          <article className="stat-card">
            <p>Plays</p>
            <strong>{currentPlayer.plays}</strong>
            <span>Appearances in the current view</span>
          </article>
          <article className="stat-card">
            <p>Wins</p>
            <strong>{currentPlayer.wins}</strong>
            <span>Winner flags in logged sessions</span>
          </article>
          <article className="stat-card">
            <p>Win rate</p>
            <strong>{currentPlayer.winRate}%</strong>
            <span>Wins divided by appearances</span>
          </article>
        </div>

        <div className="player-visual-grid">
          <article className="player-visual-panel player-activity-panel">
            <div className="player-panel-heading">
              <p className="mini-heading">Recent activity</p>
              <span>How often this player has shown up across the current slice.</span>
            </div>
            <div className="chart-wrap player-activity-chart">
              <ResponsiveContainer>
                <BarChart data={currentPlayer.monthlyActivity}>
                  <CartesianGrid stroke="#2d244a" vertical={false} />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis allowDecimals={false} stroke="#9ca3af" />
                  <Tooltip content={<ChartTooltip labelTitle="Month" seriesLabels={{ value: 'Plays' }} />} />
                  <NeonBar
                    data={currentPlayer.monthlyActivity}
                    dataKey="value"
                    gradientPair={['#ec4899', '#8b5cf6']}
                    palette={['#8b5cf6']}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <div className="player-side-stack">
            <article className="player-visual-panel player-venue-panel">
              <div className="player-panel-heading">
                <p className="mini-heading">Venue mix</p>
                <span>Where this player most often ends up playing.</span>
              </div>
              <div className="chart-wrap player-venue-chart">
                <ResponsiveContainer>
                  <PieChart>
                    <NeonPie data={currentPlayer.venueMix} innerRadius={38} outerRadius={74} palette={[...palette.slice(2), ...palette.slice(0, 2)]} />
                    <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Venue: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Sessions' }} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="player-venue-pills">
                {currentPlayer.venueMix.map((venue) => (
                  <span className="pill" key={`${currentPlayer.playerName}-${venue.label}`}>{`${venue.label} (${venue.value})`}</span>
                ))}
              </div>
            </article>
            <section className="player-focus-metrics player-visual-panel">
              <div className="player-panel-heading">
                <p className="mini-heading">Session profile</p>
                <span>The shape of a typical night when this player is involved.</span>
              </div>
              <article className="fact-card player-focus-card">
                <p className="mini-heading">Favorite weekday</p>
                <strong>{currentPlayer.favoriteWeekday}</strong>
                <span>When this player most often turns up for game night.</span>
              </article>
              <article className="fact-card player-focus-card">
                <p className="mini-heading">Average table</p>
                <strong>{currentPlayer.averageGroupSize}</strong>
                <span>Typical group size across the filtered sessions.</span>
              </article>
              <article className="fact-card player-focus-card">
                <p className="mini-heading">Average session</p>
                <strong>{currentPlayer.averagePlayTime > 0 ? `${currentPlayer.averagePlayTime} min` : 'N/A'}</strong>
                <span>Typical recorded play length when duration was logged.</span>
              </article>
            </section>
          </div>
        </div>

        <div className="player-detail-grid player-subnotes">
          <div>
            <p className="mini-heading">Favorite games</p>
            {currentPlayer.favoriteGames.map((game) => (
              <span className="pill" key={`${currentPlayer.playerName}-${game.label}`}>{`${game.label} (${game.value})`}</span>
            ))}
          </div>
          <div>
            <p className="mini-heading">Most common partners</p>
            {currentPlayer.mostCommonPartners.map((partner) => (
              <span className="pill" key={`${currentPlayer.playerName}-${partner.label}`}>{`${partner.label} (${partner.value})`}</span>
            ))}
          </div>
        </div>
      </ChartCard>

      <SocialSections metrics={metrics} />
    </div>
  )
}
