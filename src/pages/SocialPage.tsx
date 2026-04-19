import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { NetworkGraph } from '../components/NetworkGraph'
import type { DashboardMetrics } from '../types'

type SocialPageProps = {
  metrics: DashboardMetrics
}

const palette = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#38bdf8', '#f97316', '#14b8a6']

export function SocialPage({ metrics }: SocialPageProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(metrics.networkNodes[0]?.id ?? null)

  const networkDetail = useMemo(() => {
    if (!selectedNodeId) {
      return null
    }

    const player = metrics.playerInsights.find((entry) => entry.playerName === selectedNodeId)
    const connections = metrics.networkEdges
      .filter((edge) => edge.source === selectedNodeId || edge.target === selectedNodeId)
      .map((edge) => ({
        label: edge.source === selectedNodeId ? edge.target : edge.source,
        value: edge.value,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 4)

    return { connections, player }
  }, [metrics.networkEdges, metrics.playerInsights, selectedNodeId])

  return (
    <div className="page-grid">
      <ChartCard className="social-feature-card" subtitle="Who shows up most often in the selected slice." title="Most Frequent Players">
        <div className="chart-wrap social-ring-wrap">
          <div className="social-ring-center" aria-hidden="true">
            <span className="mini-heading">Top player</span>
            <strong>{metrics.topPlayers[0]?.label ?? 'No data'}</strong>
            <span>{metrics.topPlayers[0]?.value ?? 0} plays</span>
          </div>
          <ResponsiveContainer>
            <RadialBarChart
              barSize={12}
              cx="50%"
              cy="50%"
              data={metrics.topPlayers.map((player, index) => ({ ...player, fill: palette[index % palette.length] }))}
              innerRadius="42%"
              outerRadius="82%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis dataKey="value" domain={[0, metrics.topPlayers[0]?.value ?? 1]} tick={false} type="number" />
              <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Player: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Plays' }} />} />
              <RadialBar background={{ fill: 'rgba(255, 255, 255, 0.06)' }} dataKey="value" cornerRadius={10} label={{ fill: '#e5e7eb', position: 'insideStart' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard className="social-feature-card" subtitle="A simple view of which days most often turn into game nights." title="Weekday Rhythm">
        <div className="chart-wrap social-highlight-panel">
          <ResponsiveContainer>
            <BarChart data={metrics.weekdayActivity}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip content={<ChartTooltip labelTitle="Day" seriesLabels={{ value: 'Plays' }} />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {metrics.weekdayActivity.map((entry, index) => (
                  <Cell fill={palette[index % palette.length]} key={entry.label} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard className="social-network-card" subtitle="This is the social backbone of the collection: dense lines mean people really do show up together." title="Player Network">
        <NetworkGraph
          edges={metrics.networkEdges}
          nodes={metrics.networkNodes}
          onSelectNode={(nodeId) => setSelectedNodeId((current) => (current === nodeId ? null : nodeId))}
          selectedNodeId={selectedNodeId}
        />
        {networkDetail ? (
          <div className="network-detail-grid">
            <article className="fact-card">
              <p className="mini-heading">Focus player</p>
              <h3>{networkDetail.player?.playerName ?? selectedNodeId}</h3>
              <p>
                {networkDetail.player?.plays ?? 0} plays, {networkDetail.player?.wins ?? 0} wins, {networkDetail.player?.winRate ?? 0}% win rate
              </p>
            </article>
            <article className="fact-card">
              <p className="mini-heading">Closest links</p>
              {networkDetail.connections.map((connection) => (
                <div className="leaderboard-row" key={`${selectedNodeId}-${connection.label}`}>
                  <span>{connection.label}</span>
                  <strong>{connection.value}</strong>
                </div>
              ))}
            </article>
          </div>
        ) : null}
      </ChartCard>

      <ChartCard subtitle="The recurring duo graph starts here, before a network view arrives later." title="Top Pairings">
        <div className="chart-wrap social-highlight-panel">
          <ResponsiveContainer>
            <BarChart
              data={metrics.pairings.map((pairing) => ({
                label: `${pairing.playerA} + ${pairing.playerB}`,
                value: pairing.value,
              }))}
              layout="vertical"
              margin={{ left: 16, right: 12 }}
            >
              <CartesianGrid stroke="#2d244a" horizontal={false} />
              <XAxis allowDecimals={false} stroke="#9ca3af" type="number" />
              <YAxis dataKey="label" stroke="#9ca3af" type="category" width={150} />
              <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Pairing: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Shared plays' }} />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {metrics.pairings.map((pairing, index) => (
                  <Cell fill={palette[index % palette.length]} key={`${pairing.playerA}-${pairing.playerB}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Your most common table sizes say a lot about the collection and the group." title="Group Size Distribution">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={metrics.playerGroupSizes} dataKey="value" innerRadius={56} nameKey="label" outerRadius={100}>
                {metrics.playerGroupSizes.map((entry, index) => (
                  <Cell fill={palette[index % palette.length]} key={entry.label} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Table size: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Sessions' }} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Recurring full tables tell you which groups are truly durable, not just who overlaps pairwise." title="Recurring Tables">
        <div className="leaderboard-list">
          {metrics.recurringTables.map((table) => (
            <div className="leaderboard-row social-highlight-panel" key={table.players.join('-')}>
              <span>{table.players.join(' • ')}</span>
              <strong className="glow-value">{table.value}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="Quick player snapshots for the people who shape most sessions." title="Player Snapshots">
        <div className="player-cards">
          {metrics.playerInsights.slice(0, 8).map((player) => (
            <article className="player-card" key={player.playerName}>
              <div>
                <h3>{player.playerName}</h3>
                <p>
                  {player.plays} plays, {player.wins} wins, {player.winRate}% win rate
                </p>
              </div>
              <div>
                <p className="mini-heading">Favorite games</p>
                {player.favoriteGames.map((game) => (
                  <span className="pill" key={`${player.playerName}-${game.label}`}>
                    {game.label} ({game.value})
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
