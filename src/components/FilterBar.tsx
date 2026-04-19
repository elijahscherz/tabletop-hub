import type { ChangeEvent } from 'react'
import type { FilterState, NormalizedData } from '../types'

type FilterBarProps = {
  filters: FilterState
  normalized: NormalizedData
  onChange: (next: FilterState) => void
  onReset: () => void
}

function parseNullableNumber(event: ChangeEvent<HTMLSelectElement>) {
  return event.target.value ? Number(event.target.value) : null
}

export function FilterBar({ filters, normalized, onChange, onReset }: FilterBarProps) {
  return (
    <section className="panel filters-panel">
      <div className="panel-header">
        <div>
          <h2>Filters</h2>
          <p>Trim the dashboard by time, people, games, and table shape.</p>
        </div>
        <button className="ghost-button" onClick={onReset} type="button">
          Reset
        </button>
      </div>

      <div className="filters-grid">
        <label>
          <span>Start date</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
          />
        </label>

        <label>
          <span>End date</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
          />
        </label>

        <label>
          <span>Player</span>
          <select
            value={filters.playerId ?? ''}
            onChange={(event) => onChange({ ...filters, playerId: parseNullableNumber(event) })}
          >
            <option value="">All players</option>
            {normalized.players
              .filter((player) => !player.isAnonymous)
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>
        </label>

        <label>
          <span>Game</span>
          <select
            value={filters.gameId ?? ''}
            onChange={(event) => onChange({ ...filters, gameId: parseNullableNumber(event) })}
          >
            <option value="">All games</option>
            {normalized.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Tag</span>
          <select
            value={filters.tagId ?? ''}
            onChange={(event) => onChange({ ...filters, tagId: parseNullableNumber(event) })}
          >
            <option value="">All tags</option>
            {normalized.tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Player count</span>
          <select
            value={filters.playerCount ?? ''}
            onChange={(event) => onChange({ ...filters, playerCount: parseNullableNumber(event) })}
          >
            <option value="">All table sizes</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((count) => (
              <option key={count} value={count}>
                {count} players
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Location</span>
          <select
            value={filters.locationId ?? ''}
            onChange={(event) => onChange({ ...filters, locationId: parseNullableNumber(event) })}
          >
            <option value="">All locations</option>
            {normalized.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
