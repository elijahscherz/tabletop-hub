import { useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { FilterBar } from './components/FilterBar'
import { buildMetrics, defaultFilters, normalizeData } from './data/dashboardData'
import type { EnrichedPlay, FilterState } from './types'
import { ChallengesPage } from './pages/ChallengesPage'
import { CollectionPage } from './pages/CollectionPage'
import { GamesPage } from './pages/GamesPage'
import { OverviewPage } from './pages/OverviewPage'
import { PlayersPage } from './pages/PlayersPage'
import { SocialPage } from './pages/SocialPage'

const normalized = normalizeData()
const dayPresets = ['week', 'month', 'quarter', 'year', 'all'] as const

type DatePreset = (typeof dayPresets)[number]

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function shiftUtcDate(date: Date, options: { days?: number; months?: number; years?: number }) {
  const next = new Date(date)

  if (options.months || options.years) {
    const targetYear = next.getUTCFullYear() + (options.years ?? 0)
    const targetMonth = next.getUTCMonth() + (options.months ?? 0)
    const day = next.getUTCDate()
    const monthStart = new Date(Date.UTC(targetYear, targetMonth, 1))
    const lastDay = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).getUTCDate()

    next.setTime(monthStart.getTime())
    next.setUTCDate(Math.min(day, lastDay))
  }

  if (options.days) {
    next.setUTCDate(next.getUTCDate() + options.days)
  }

  return next
}

function getLatestPlayDate(plays: EnrichedPlay[]) {
  return plays.reduce((latest, play) => {
    const date = new Date(`${play.playDate.slice(0, 10)}T00:00:00Z`)
    return date > latest ? date : latest
  }, new Date('2000-01-01T00:00:00Z'))
}

function buildDateRangePreset(latestPlayDate: Date, preset: DatePreset): Pick<FilterState, 'endDate' | 'startDate'> {
  if (preset === 'all') {
    return { endDate: '', startDate: '' }
  }

  const endDate = formatDateInput(latestPlayDate)

  if (preset === 'week') {
    return { endDate, startDate: formatDateInput(shiftUtcDate(latestPlayDate, { days: -6 })) }
  }

  if (preset === 'month') {
    return { endDate, startDate: formatDateInput(shiftUtcDate(latestPlayDate, { months: -1 })) }
  }

  if (preset === 'quarter') {
    return { endDate, startDate: formatDateInput(shiftUtcDate(latestPlayDate, { months: -3 })) }
  }

  return { endDate, startDate: formatDateInput(shiftUtcDate(latestPlayDate, { years: -1 })) }
}

function buildDefaultFilters(latestPlayDate: Date): FilterState {
  return { ...defaultFilters, ...buildDateRangePreset(latestPlayDate, 'quarter') }
}

function getActiveDatePreset(filters: FilterState, latestPlayDate: Date) {
  return dayPresets.find((preset) => {
    const candidate = buildDateRangePreset(latestPlayDate, preset)
    return candidate.startDate === filters.startDate && candidate.endDate === filters.endDate
  })
}

const latestPlayDate = getLatestPlayDate(normalized.enrichedPlays)
const initialFilters = buildDefaultFilters(latestPlayDate)

function App() {
  const [filters, setFilters] = useState(initialFilters)
  const metrics = useMemo(() => buildMetrics(normalized, filters), [filters])
  const activeDatePreset = getActiveDatePreset(filters, latestPlayDate) ?? null

  return (
    <AppShell>
      <FilterBar
        activeDatePreset={activeDatePreset}
        filters={filters}
        normalized={normalized}
        onApplyDatePreset={(preset) => setFilters((current) => ({ ...current, ...buildDateRangePreset(latestPlayDate, preset) }))}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />
      <Routes>
        <Route element={<OverviewPage metrics={metrics} />} path="/" />
        <Route element={<SocialPage metrics={metrics} />} path="/social" />
        <Route element={<GamesPage metrics={metrics} />} path="/games" />
        <Route element={<CollectionPage metrics={metrics} />} path="/collection" />
        <Route element={<ChallengesPage metrics={metrics} />} path="/challenges" />
        <Route element={<PlayersPage metrics={metrics} />} path="/players" />
      </Routes>
    </AppShell>
  )
}

export default App
