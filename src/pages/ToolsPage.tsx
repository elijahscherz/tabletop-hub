import { useMemo, useState } from 'react'
import { ChartCard } from '../components/ChartCard'
import { FingerPicker } from '../components/FingerPicker'
import type { DashboardMetrics, FilterState, NormalizedData } from '../types'

type ToolsPageProps = {
  filters: FilterState
  metrics: DashboardMetrics
  normalized: NormalizedData
}

type GroupGame = {
  count: number
  name: string
}

function shuffleList<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]!
    next[index] = next[swapIndex]!
    next[swapIndex] = current
  }

  return next
}

function splitIntoTeams(players: string[], teamCount: number) {
  const teams = Array.from({ length: teamCount }, (_, index) => ({ label: `Team ${index + 1}`, players: [] as string[] }))

  shuffleList(players).forEach((player, index) => {
    teams[index % teamCount]!.players.push(player)
  })

  return teams
}

export function ToolsPage({ filters, metrics, normalized }: ToolsPageProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([])
  const [firstPlayer, setFirstPlayer] = useState<string | null>(null)
  const [turnOrder, setTurnOrder] = useState<string[]>([])
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<Array<{ label: string; players: string[] }>>([])
  const [pickedGame, setPickedGame] = useState<GroupGame | null>(null)

  const playerLookup = useMemo(() => new Map(normalized.players.map((player) => [player.id, player])), [normalized.players])

  const playerCounts = useMemo(() => {
    const counts = new Map<number, number>()

    metrics.filteredPlays.forEach((play) => {
      play.players.forEach((player) => {
        counts.set(player.id, (counts.get(player.id) ?? 0) + 1)
      })
    })

    return counts
  }, [metrics.filteredPlays])

  const availablePlayers = useMemo(
    () =>
      normalized.players
        .filter((player) => !player.isAnonymous)
        .sort((left, right) => {
          const rightCount = playerCounts.get(right.id) ?? 0
          const leftCount = playerCounts.get(left.id) ?? 0
          return rightCount - leftCount || left.name.localeCompare(right.name)
        }),
    [normalized.players, playerCounts],
  )

  const selectedPlayers = selectedPlayerIds.map((playerId) => playerLookup.get(playerId)).filter(Boolean)
  const selectedNames = selectedPlayers.map((player) => player!.name)

  const groupPlays = useMemo(() => {
    if (selectedPlayerIds.length === 0) {
      return []
    }

    return metrics.filteredPlays.filter((play) => selectedPlayerIds.every((playerId) => play.players.some((player) => player.id === playerId)))
  }, [metrics.filteredPlays, selectedPlayerIds])

  const groupGames = useMemo(() => {
    const counts = new Map<string, number>()

    groupPlays.forEach((play) => {
      counts.set(play.gameName, (counts.get(play.gameName) ?? 0) + 1)
    })

    return [...counts.entries()]
      .map(([name, count]) => ({ count, name }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
  }, [groupPlays])

  const contextLabel = [filters.startDate || 'start', filters.endDate || 'today'].join(' to ')

  function togglePlayer(playerId: number) {
    setSelectedPlayerIds((current) => {
      const next = current.includes(playerId) ? current.filter((value) => value !== playerId) : [...current, playerId]
      setFirstPlayer(null)
      setTurnOrder([])
      setTeams([])
      setPickedGame(null)
      return next
    })
  }

  function pickFirstPlayer() {
    if (selectedNames.length === 0) {
      return
    }

    setFirstPlayer(selectedNames[Math.floor(Math.random() * selectedNames.length)] ?? null)
  }

  function generateTurnOrder() {
    if (selectedNames.length === 0) {
      return
    }

    setTurnOrder(shuffleList(selectedNames))
  }

  function generateTeams() {
    if (selectedNames.length === 0) {
      return
    }

    setTeams(splitIntoTeams(selectedNames, Math.max(2, Math.min(teamCount, selectedNames.length))))
  }

  function pickRandomGroupGame() {
    if (groupGames.length === 0) {
      setPickedGame(null)
      return
    }

    const pool = groupGames.slice(0, Math.min(groupGames.length, 12))
    setPickedGame(pool[Math.floor(Math.random() * pool.length)] ?? null)
  }

  return (
    <div className="page-grid">
      <section className="hero-band full-width tools-hero">
        <div>
          <p className="eyebrow">Quick utilities</p>
          <h3>Fast table tools for the current play slice</h3>
          <p>Build a temporary group, pick a first player, generate teams, and use the active filters as the current context for quick decisions.</p>
        </div>
        <div className="tools-context-summary">
          <span className="thumb-badge">{metrics.filteredPlays.length} plays in context</span>
          <span className="thumb-badge">{selectedNames.length} selected players</span>
          <span className="thumb-badge">{contextLabel}</span>
        </div>
      </section>

      <ChartCard className="full-width" subtitle="Everyone puts a finger down, holds for a beat, and one touch gets picked automatically." title="Finger Picker">
        <FingerPicker />
      </ChartCard>

      <ChartCard className="full-width" subtitle="Tap people once to bring them into the current group for all the quick tools below." title="Player Picker">
        <div className="tools-player-grid">
          {availablePlayers.map((player) => {
            const isActive = selectedPlayerIds.includes(player.id)
            const count = playerCounts.get(player.id) ?? 0

            return (
              <button className={`tools-player-chip${isActive ? ' is-active' : ''}`} key={player.id} onClick={() => togglePlayer(player.id)} type="button">
                <span>{player.name}</span>
                <strong>{count}</strong>
              </button>
            )
          })}
        </div>
      </ChartCard>

      <ChartCard subtitle="The current group, ready for randomizers and table helpers." title="Current Group">
        <div className="tools-selected-panel">
          {selectedNames.length > 0 ? selectedNames.map((name) => <span className="pill" key={name}>{name}</span>) : <p>Select a few players to get started.</p>}
        </div>
      </ChartCard>

      <ChartCard subtitle="One tap for who starts, another for a full table order." title="Who Goes First?">
        <div className="tools-action-stack">
          <div className="tools-button-row">
            <button className="ghost-button" disabled={selectedNames.length === 0} onClick={pickFirstPlayer} type="button">
              Pick first player
            </button>
            <button className="ghost-button" disabled={selectedNames.length === 0} onClick={generateTurnOrder} type="button">
              Shuffle turn order
            </button>
          </div>

          {firstPlayer ? (
            <article className="fact-card tools-result-card">
              <p className="mini-heading">Starting player</p>
              <h3>{firstPlayer}</h3>
            </article>
          ) : null}

          {turnOrder.length > 0 ? (
            <div className="leaderboard-list">
              {turnOrder.map((player, index) => (
                <div className="leaderboard-row" key={`${player}-${index}`}>
                  <span>{player}</span>
                  <strong>#{index + 1}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </ChartCard>

      <ChartCard subtitle="Quickly split the selected group into balanced random teams." title="Random Teams">
        <div className="tools-action-stack">
          <div className="tools-inline-controls">
            <label>
              <span>Teams</span>
              <select value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))}>
                {[2, 3, 4].map((count) => (
                  <option key={count} value={count}>
                    {count} teams
                  </option>
                ))}
              </select>
            </label>
            <button className="ghost-button" disabled={selectedNames.length < 2} onClick={generateTeams} type="button">
              Generate teams
            </button>
          </div>

          {teams.length > 0 ? (
            <div className="player-cards tools-team-grid">
              {teams.map((team) => (
                <article className="player-card" key={team.label}>
                  <p className="mini-heading">{team.label}</p>
                  <h3>{team.players.length} players</h3>
                  <div>{team.players.map((player) => <span className="pill" key={`${team.label}-${player}`}>{player}</span>)}</div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </ChartCard>

      <ChartCard subtitle="Pull a game from the current filtered slice that this selected group has actually played together." title="Random Group Game">
        <div className="tools-action-stack">
          <div className="tools-button-row">
            <button className="ghost-button" disabled={groupGames.length === 0} onClick={pickRandomGroupGame} type="button">
              Pick a game
            </button>
          </div>

          {pickedGame ? (
            <article className="fact-card tools-result-card">
              <p className="mini-heading">Random pick</p>
              <h3>{pickedGame.name}</h3>
              <p>{pickedGame.count} logged plays with this group in the current context.</p>
            </article>
          ) : null}

          <div className="leaderboard-list">
            {groupGames.slice(0, 6).map((game) => (
              <div className="leaderboard-row" key={game.name}>
                <span>{game.name}</span>
                <strong>{game.count}</strong>
              </div>
            ))}
            {groupGames.length === 0 ? <p>No shared games found for the selected group in this filtered slice yet.</p> : null}
          </div>
        </div>
      </ChartCard>

      <ChartCard className="full-width" subtitle="This is scaffolded for now, but the selected group and current filter context are already in place for future recommendations." title="Group Recommendations">
        <div className="facts-list tools-scaffold-grid">
          <article className="fact-card">
            <p className="mini-heading">Current group overlap</p>
            <h3>{groupPlays.length}</h3>
            <p>Filtered plays where every selected player was at the table.</p>
          </article>
          <article className="fact-card">
            <p className="mini-heading">Most common shared game</p>
            <h3>{groupGames[0]?.name ?? 'Not enough overlap yet'}</h3>
            <p>{groupGames[0] ? `${groupGames[0].count} shared plays in view.` : 'Pick a group with some overlapping history.'}</p>
          </article>
          <article className="fact-card">
            <p className="mini-heading">Coming next</p>
            <h3>Recommendation engine</h3>
            <p>Planned inputs: shared history, table size, tags, and the current filter window.</p>
          </article>
        </div>
      </ChartCard>
    </div>
  )
}
