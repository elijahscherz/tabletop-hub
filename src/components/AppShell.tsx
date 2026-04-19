import {
  Bars3Icon,
  ChartBarIcon,
  CircleStackIcon,
  TrophyIcon,
  UserGroupIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type AppShellProps = {
  children: ReactNode
}

const navItems = [
  { icon: ChartBarIcon, label: 'Overview', to: '/' },
  { icon: UserGroupIcon, label: 'Social', to: '/social' },
  { icon: TrophyIcon, label: 'Games', to: '/games' },
  { icon: CircleStackIcon, label: 'Collection', to: '/collection' },
  { icon: TrophyIcon, label: 'Challenges', to: '/challenges' },
  { icon: UserIcon, label: 'Players', to: '/players' },
]

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div>
            <p className="eyebrow">Board Game Intelligence</p>
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

        <div className="sidebar-footer">
          <p>Auto-loading the bundled export so the app opens straight into your history.</p>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileOpen(true)} type="button">
            <Bars3Icon />
          </button>
          <div>
            <p className="eyebrow">Personal analytics</p>
            <h2>Years of play history, social patterns, and collection signals</h2>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
