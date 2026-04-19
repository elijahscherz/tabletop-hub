import { useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { FilterBar } from './components/FilterBar'
import { buildMetrics, defaultFilters, normalizeData } from './data/dashboardData'
import { ChallengesPage } from './pages/ChallengesPage'
import { CollectionPage } from './pages/CollectionPage'
import { GamesPage } from './pages/GamesPage'
import { OverviewPage } from './pages/OverviewPage'
import { PlayersPage } from './pages/PlayersPage'
import { SocialPage } from './pages/SocialPage'

const normalized = normalizeData()

function App() {
  const [filters, setFilters] = useState(defaultFilters)
  const metrics = useMemo(() => buildMetrics(normalized, filters), [filters])

  return (
    <AppShell>
      <FilterBar filters={filters} normalized={normalized} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
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
