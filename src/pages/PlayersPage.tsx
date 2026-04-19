import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
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
      <ChartCard subtitle="Use this page for the people-centric view of your play history." title="Player Drilldown">
        <div className="toolbar-row">
          <select value={selectedPlayer} onChange={(event) => setSelectedPlayer(event.target.value)}>
            {metrics.playerInsights.map((player) => (
              <option key={player.playerName} value={player.playerName}>
                {player.playerName}
              </option>
            ))}
          </select>
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

        <div className="player-detail-grid">
          <div>
            <p className="mini-heading">Favorite games</p>
            {currentPlayer.favoriteGames.map((game) => (
              <div className="leaderboard-row" key={`${currentPlayer.playerName}-${game.label}`}>
                <span>{game.label}</span>
                <strong>{game.value}</strong>
              </div>
            ))}
          </div>
          <div>
            <p className="mini-heading">Most common partners</p>
            {currentPlayer.mostCommonPartners.map((partner) => (
              <div className="leaderboard-row" key={`${currentPlayer.playerName}-${partner.label}`}>
                <span>{partner.label}</span>
                <strong>{partner.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="player-visual-grid">
          <div className="chart-wrap">
            <ResponsiveContainer>
              <BarChart data={currentPlayer.monthlyActivity}>
                <CartesianGrid stroke="#2d244a" vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip content={<ChartTooltip labelTitle="Month" seriesLabels={{ value: 'Plays' }} />} />
                <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrap split-pies">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={currentPlayer.preferredTags} dataKey="value" innerRadius={38} nameKey="label" outerRadius={74}>
                  {currentPlayer.preferredTags.map((tag, index) => (
                    <Cell fill={palette[index % palette.length]} key={tag.label} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Tag: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Plays' }} />} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={currentPlayer.venueMix} dataKey="value" innerRadius={38} nameKey="label" outerRadius={74}>
                  {currentPlayer.venueMix.map((venue, index) => (
                    <Cell fill={palette[(index + 2) % palette.length]} key={venue.label} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Venue: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Sessions' }} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="player-detail-grid player-subnotes">
          <div>
            <p className="mini-heading">Preferred tags</p>
            {currentPlayer.preferredTags.map((tag) => (
              <span className="pill" key={`${currentPlayer.playerName}-${tag.label}`}>{`${tag.label} (${tag.value})`}</span>
            ))}
          </div>
          <div>
            <p className="mini-heading">Top venues</p>
            {currentPlayer.venueMix.map((venue) => (
              <span className="pill" key={`${currentPlayer.playerName}-${venue.label}`}>{`${venue.label} (${venue.value})`}</span>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  )
}
