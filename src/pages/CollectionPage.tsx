import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

type CollectionPageProps = {
  metrics: DashboardMetrics
}

function toBggUrl(bggId: number | null) {
  return bggId ? `https://boardgamegeek.com/boardgame/${bggId}` : null
}

export function CollectionPage({ metrics }: CollectionPageProps) {
  const currencyValue = (value: unknown) => (typeof value === 'number' ? `$${value.toFixed(2)}` : String(value ?? ''))
  const shelfGames = metrics.collectionInsights.filter((game) => game.playCount > 0).slice(0, 16)
  const visibleShelfGames = shelfGames.length > 0 ? shelfGames : metrics.collectionInsights.slice(0, 16)

  const scatterData = metrics.collectionInsights.slice(0, 50).map((game) => ({
    label: game.name,
    x: game.pricePaid,
    y: game.hoursPlayed,
    z: Math.max(game.playCount, 4),
  }))

  return (
    <div className="page-grid">
      <section className="stats-grid full-width">
        {metrics.collectionStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <section className="facts-list full-width collection-callouts">
        {metrics.collectionCallouts.map((callout) => (
          <article className="fact-card" key={callout.label}>
            <p className="mini-heading">{callout.label}</p>
            <h3>{callout.value}</h3>
            <p>{callout.note}</p>
          </article>
        ))}
      </section>

      <ChartCard
        className="full-width"
        subtitle="Box covers from the current filtered slice, with quick links out to BoardGameGeek when available."
        title="Shelf Highlights"
      >
        <div className="collection-shelf-grid">
          {visibleShelfGames.map((game) => {
            const bggUrl = toBggUrl(game.bggId)
            const content = (
              <>
                {game.coverImageUrl ? <img alt={game.name} className="collection-shelf-image" src={game.coverImageUrl} /> : <div className="collection-shelf-image" />}
                <div className="collection-shelf-overlay">
                  <p className="eyebrow">{game.playCount} plays</p>
                  <h3>{game.name}</h3>
                  <div className="collection-shelf-meta">
                    <span className="thumb-badge">Value {currencyValue(game.pricePaid)}</span>
                    {game.rating > 0 ? <span className="thumb-badge">Rating {game.rating.toFixed(1)}</span> : null}
                    {bggUrl ? <span className="thumb-badge">Open on BGG</span> : null}
                  </div>
                </div>
              </>
            )

            return (
              <article className="collection-shelf-card" key={game.name}>
                {bggUrl ? (
                  <a className="collection-shelf-link" href={bggUrl} rel="noreferrer" target="_blank">
                    {content}
                  </a>
                ) : (
                  <div className="collection-shelf-link">{content}</div>
                )}
              </article>
            )
          })}
        </div>
      </ChartCard>

      <ChartCard subtitle="Recorded collection value over acquisition years from the export data." title="Value Over Time">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <BarChart data={metrics.priceByYear}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<ChartTooltip labelTitle="Year" seriesLabels={{ value: 'Value' }} valueFormatter={currencyValue} />} />
              <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Collection value by tag helps show where the shelf value is concentrated." title="Value By Tag">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={metrics.spendByTag} dataKey="value" innerRadius={54} nameKey="label" outerRadius={104} />
               <Tooltip content={<ChartTooltip labelFormatter={(_, payload) => `Tag: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ value: 'Value' }} valueFormatter={currencyValue} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Value efficiency by acquisition year shows whether some collecting eras have delivered more table time than others." title="Value Efficiency By Year">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <LineChart data={metrics.collectionRoiByYear}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                content={<ChartTooltip labelTitle="Year" seriesLabels={{ spend: 'Value', plays: 'Plays', costPerPlay: 'Value per play' }} valueFormatter={(value, entry) => (entry.dataKey === 'spend' || entry.dataKey === 'costPerPlay' ? currencyValue(value) : typeof value === 'number' ? value.toLocaleString() : String(value ?? ''))} />}
              />
              <Line dataKey="spend" name="Value" stroke="#f59e0b" strokeWidth={2} type="monotone" />
              <Line dataKey="plays" name="Plays" stroke="#8b5cf6" strokeWidth={2} type="monotone" />
              <Line dataKey="costPerPlay" name="Value/play" stroke="#22c55e" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="A simple value-versus-usefulness view: collection value on one axis, time on table on the other." title="Value Vs Hours Played">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <ScatterChart margin={{ bottom: 12, left: 10, right: 12, top: 8 }}>
              <CartesianGrid stroke="#2d244a" />
              <XAxis dataKey="x" name="Tracked value" stroke="#9ca3af" type="number" />
              <YAxis dataKey="y" name="Hours played" stroke="#9ca3af" type="number" />
              <Tooltip
                content={<ChartTooltip labelFormatter={(_, payload) => `Game: ${String(payload?.label ?? 'Unknown')}`} seriesLabels={{ x: 'Value', y: 'Hours played', z: 'Play count' }} valueFormatter={(value, entry) => (entry.dataKey === 'x' ? currencyValue(value) : typeof value === 'number' ? value.toFixed(1) : String(value ?? ''))} />}
                cursor={{ strokeDasharray: '4 4' }}
              />
              <Scatter data={scatterData} fill="#22c55e" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Your strongest return-on-table-time titles rise to the top here." title="Collection Health">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Tracked value</th>
                <th>Plays</th>
                <th>Hours</th>
                <th>Value/play</th>
                <th>Value/hour</th>
                <th>Days to first play</th>
                <th>Value score</th>
              </tr>
            </thead>
            <tbody>
              {metrics.collectionInsights.slice(0, 40).map((game) => (
                <tr key={game.name}>
                  <td>
                    <div className="game-name-cell">
                      {game.coverImageUrl ? <img alt="" className="inline-thumb" src={game.coverImageUrl} /> : <div className="inline-thumb" />}
                      <span>{game.name}</span>
                    </div>
                  </td>
                  <td>{`$${game.pricePaid.toFixed(2)}`}</td>
                  <td>{game.playCount}</td>
                  <td>{game.hoursPlayed.toFixed(1)}</td>
                  <td>{game.costPerPlay === null ? 'n/a' : `$${game.costPerPlay.toFixed(2)}`}</td>
                  <td>{game.costPerHour === null ? 'n/a' : `$${game.costPerHour.toFixed(2)}`}</td>
                  <td>{game.daysToFirstPlay === null ? 'n/a' : game.daysToFirstPlay}</td>
                  <td>{game.valueScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
