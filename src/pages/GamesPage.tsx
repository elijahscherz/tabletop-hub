import type { CSSProperties } from 'react'
import { useState } from 'react'
import {
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import type { DashboardMetrics } from '../types'

type GamesPageProps = {
  metrics: DashboardMetrics
}

const palette = ['#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#38bdf8', '#f97316', '#14b8a6', '#f43f5e']

export function GamesPage({ metrics }: GamesPageProps) {
  const [query, setQuery] = useState('')
  const visibleRows = metrics.gameRows.filter((game) => game.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="page-grid">
      <ChartCard subtitle="Let the best-performing titles lead with their box presence, not just a row in a table." title="Most Played Covers">
        <div className="thumbnail-grid">
          {metrics.gameRows.slice(0, 6).map((game) => (
            <article
              className="thumbnail-card"
              key={game.name}
              style={{ '--thumb-image': game.coverImageUrl ? `url(${game.coverImageUrl})` : 'none' } as CSSProperties}
            >
              <div className="thumbnail-card-content">
                <p className="eyebrow">{game.playCount} logged plays</p>
                <h3>{game.name}</h3>
                <p>{game.tagNames.slice(0, 2).join(' • ') || 'Uncategorized favorite'}</p>
                <div className="thumbnail-meta">
                  <span className="thumb-badge">Avg group {game.averageGroupSize}</span>
                  <span className="thumb-badge">{game.playerRange} players</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="A lightweight recommender based on historical demand, group fit, tag fit, and the currently selected player." title="Recommended Next Plays">
        <div className="thumbnail-grid recommend-grid">
          {metrics.recommendations.map((game) => (
            <article
              className="thumbnail-card recommend-card"
              key={game.name}
              style={{ '--thumb-image': game.coverImageUrl ? `url(${game.coverImageUrl})` : 'none' } as CSSProperties}
            >
              <div className="thumbnail-card-content">
                <p className="eyebrow">Fit score {game.fitScore}</p>
                <h3>{game.name}</h3>
                <div className="thumbnail-meta">
                  <span className="thumb-badge">{game.playCount} plays</span>
                  <span className="thumb-badge">Avg group {game.averageGroupSize}</span>
                </div>
                <div className="recommend-reasons">
                  {game.reasons.map((reason) => (
                    <p key={`${game.name}-${reason}`}>{reason}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="These recurring groups act like mini personas: when this table forms, these are the titles it historically reaches for." title="Group Recipes">
        <div className="player-cards">
          {metrics.recurringTableGameMix.map((group) => (
            <article className="player-card" key={group.players.join('-')}>
              <div>
                <p className="mini-heading">{group.value} sessions together</p>
                <h3>{group.players.join(' • ')}</h3>
              </div>
              <div>
                {group.games.map((game) => (
                  <span className="pill" key={`${group.players.join('-')}-${game.label}`}>
                    {game.label} ({game.value})
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="Which kinds of games dominate the actual table time, not just the shelf." title="Tag Portfolio">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={metrics.tagBreakdown} dataKey="value" innerRadius={50} nameKey="label" outerRadius={104}>
                {metrics.tagBreakdown.map((entry, index) => (
                  <Cell fill={palette[index % palette.length]} key={entry.label} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Tag: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Plays' }} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="A quick way to spot which games shine at different table sizes and come back to the table often." title="Game Opportunity Map">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <ScatterChart margin={{ bottom: 12, left: 8, right: 8, top: 8 }}>
              <CartesianGrid stroke="#2d244a" />
              <XAxis dataKey="x" name="Average group size" stroke="#9ca3af" type="number" />
              <YAxis dataKey="y" name="Play count" stroke="#9ca3af" type="number" />
              <Tooltip
                content={<ChartTooltip labelFormatter={(_, payload) => `Game: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ x: 'Average group size', y: 'Play count', z: 'Bubble size' }} />}
                cursor={{ strokeDasharray: '4 4' }}
              />
              <Scatter data={metrics.gameScatter} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Duration quality is patchy, but the distribution still helps frame the collection." title="Session Duration Mix">
        <div className="leaderboard-list">
          {metrics.durationBuckets.map((bucket, index) => (
            <div className="leaderboard-row" key={bucket.label}>
              <span className="rank-chip">{index + 1}</span>
              <span>{bucket.label}</span>
              <strong>{bucket.value}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard subtitle="The filtered play leaders, with a little more collection context." title="Game Explorer">
        <div className="toolbar-row">
          <input
            className="search-input"
            placeholder="Search games"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Plays</th>
                <th>Avg group</th>
                <th>Avg duration</th>
                <th>Player range</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.slice(0, 40).map((game) => (
                <tr key={game.name}>
                  <td>
                    <div className="game-name-cell">
                      {game.thumbnailUrl ? <img alt="" className="inline-thumb" src={game.thumbnailUrl} /> : <div className="inline-thumb" />}
                      <span>{game.name}</span>
                    </div>
                  </td>
                  <td>{game.playCount}</td>
                  <td>{game.averageGroupSize}</td>
                  <td>{game.averagePlayTime > 0 ? `${game.averagePlayTime} min` : 'n/a'}</td>
                  <td>{game.playerRange}</td>
                  <td>{game.tagNames.slice(0, 3).join(', ') || 'Uncategorized'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
