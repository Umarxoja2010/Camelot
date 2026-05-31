import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { navItemsFor } from '@/lib/nav'
import LanguageSwitcher from './LanguageSwitcher'

export default function DashboardLayout() {
  const { t } = useTranslation()
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const items = role ? navItemsFor(role) : []

  // Yangi sahifaga o'tilganda mobil menyuni yopamiz
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // O'qilmagan bildirishnomalar soni
  useEffect(() => {
    let active = true
    const load = () =>
      api
        .get<{ count: number }>('/notifications/unread-count')
        .then((r) => active && setUnread(r.data.count))
        .catch(() => {})
    load()
    const id = setInterval(load, 60000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 px-2 py-1 text-lg font-bold text-brand-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">C</span>
        {t('app.name')}
      </Link>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <span className="text-lg">{item.icon}</span>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 pt-2">
        <NavLink to="/profile" className={linkClass}>
          <span className="text-lg">⚙️</span>
          {t('nav.profile')}
        </NavLink>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              ☰
            </button>
            <div className="text-sm text-slate-500">
              {user?.name} · <span className="text-slate-400">{role && t(`roles.${role}`)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label={t('nav.notifications')}
            >
              <span className="text-xl">🔔</span>
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <LanguageSwitcher />
            <button onClick={handleLogout} className="btn-outline">
              {t('auth.logout')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
