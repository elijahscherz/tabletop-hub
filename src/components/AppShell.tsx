import {
  Bars3Icon,
  ChartBarIcon,
  CircleStackIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

type AppShellProps = {
  children: ReactNode
  headerAside?: ReactNode
}

type PageHeader = {
  eyebrow: string
  subtitle: string
}

const navItems = [
  { icon: ChartBarIcon, label: 'Overview', to: '/' },
  { icon: UserIcon, label: 'Players', to: '/players' },
  { icon: WrenchScrewdriverIcon, label: 'Tools', to: '/tools' },
  { icon: TrophyIcon, label: 'Games', to: '/games' },
  { icon: CircleStackIcon, label: 'Collection', to: '/collection' },
  { icon: SparklesIcon, label: 'Challenges', to: '/challenges' },
]

const defaultPageHeader: PageHeader = {
  eyebrow: 'Overview',
  subtitle: 'A quick look at your rhythms, favorite tables, and the stretches where game night was especially lively.',
}

const pageHeaders: Record<string, PageHeader> = {
  '/': {
    eyebrow: defaultPageHeader.eyebrow,
    subtitle: defaultPageHeader.subtitle,
  },
  '/games': {
    eyebrow: 'Games',
    subtitle: 'Focus on the titles driving repeat play, the tags shaping the collection, and the games most likely to fit the next session.',
  },
  '/collection': {
    eyebrow: 'Collection',
    subtitle: 'Trace what the shelf is worth, where that value is concentrated, and which games have actually earned their space.',
  },
  '/challenges': {
    eyebrow: 'Challenges',
    subtitle: 'Track which challenge arcs gained real momentum and how the current filter slice changes the picture.',
  },
  '/players': {
    eyebrow: 'Players',
    subtitle: 'See who plays most often, how the group clusters, and drill into individual histories, partners, tags, and venues.',
  },
  '/social': {
    eyebrow: 'Players',
    subtitle: 'See who plays most often, how the group clusters, and drill into individual histories, partners, tags, and venues.',
  },
  '/tools': {
    eyebrow: 'Tools',
    subtitle: 'Use the current filtered slice to spin up table helpers, randomizers, and quick session-planning utilities.',
  },
}

export function AppShell({ children, headerAside }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const pageHeader = pageHeaders[location.pathname] ?? defaultPageHeader

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div>
            <p className="eyebrow">Tabletop Hub</p>
            <h1>Dashboard</h1>
          </div>
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(false)} type="button">
            <XMarkIcon />
          </button>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setMobileOpen(false)}
              to={item.to}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="content-shell">
        <div className="topbar-row">
          <header className="topbar">
            <button className="icon-button mobile-only" onClick={() => setMobileOpen(true)} type="button">
              <Bars3Icon />
            </button>
            <div>
              <p className="eyebrow">{pageHeader.eyebrow}</p>
              <p className="topbar-copy">{pageHeader.subtitle}</p>
            </div>
          </header>
          {headerAside ? <div className="topbar-aside">{headerAside}</div> : null}
        </div>
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
