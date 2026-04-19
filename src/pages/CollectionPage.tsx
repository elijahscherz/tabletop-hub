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
import type { DashboardMetrics } from '../types'

type CollectionPageProps = {
  metrics: DashboardMetrics
}

export function CollectionPage({ metrics }: CollectionPageProps) {
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

      <ChartCard subtitle="Recorded spend over acquisition years from the collection export." title="Spend Over Time">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <BarChart data={metrics.priceByYear}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Spending by tag helps answer where the money is actually concentrated in the collection." title="Spend By Tag">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={metrics.spendByTag} dataKey="value" innerRadius={54} nameKey="label" outerRadius={104} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="Return on investment by acquisition year shows whether some buying eras were much healthier than others." title="ROI By Year">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <LineChart data={metrics.collectionRoiByYear}>
              <CartesianGrid stroke="#2d244a" vertical={false} />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line dataKey="spend" name="Spend" stroke="#f59e0b" strokeWidth={2} type="monotone" />
              <Line dataKey="plays" name="Plays" stroke="#8b5cf6" strokeWidth={2} type="monotone" />
              <Line dataKey="costPerPlay" name="Cost/play" stroke="#22c55e" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="This is the key value-for-money view: spend on one axis, time on table on the other." title="Price Vs Hours Played">
        <div className="chart-wrap">
          <ResponsiveContainer>
            <ScatterChart margin={{ bottom: 12, left: 10, right: 12, top: 8 }}>
              <CartesianGrid stroke="#2d244a" />
              <XAxis dataKey="x" name="Price paid" stroke="#9ca3af" type="number" />
              <YAxis dataKey="y" name="Hours played" stroke="#9ca3af" type="number" />
              <Tooltip cursor={{ strokeDasharray: '4 4' }} />
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
                <th>Price paid</th>
                <th>Plays</th>
                <th>Hours</th>
                <th>Cost/play</th>
                <th>Cost/hour</th>
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
