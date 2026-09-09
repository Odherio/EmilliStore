import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/config', label: 'Configurações' },
]

export function AdminLayout() {
  const { isAdmin, logout } = useStore()
  const location = useLocation()

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-brand-soft bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="mr-auto">
            <p className="font-display text-xl leading-none">EmilliStore</p>
            <p className="text-xs text-muted">Painel admin</p>
          </div>
          <Link to="/" className="text-sm text-muted underline">
            Ver loja
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full bg-brand-soft px-3 py-1.5 text-sm"
          >
            Sair
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {links.map((l) => {
            const active = l.end
              ? location.pathname === l.to
              : location.pathname.startsWith(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  active ? 'bg-brand text-white' : 'bg-cream text-ink'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
