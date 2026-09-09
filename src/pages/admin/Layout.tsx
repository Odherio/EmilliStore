import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Wallet,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatBRL } from '../../lib/format'

const SEEN_KEY = 'emilli.pedidos.vistos'

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeSeen(ids: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]))
}

const links = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, badge: true },
  { to: '/admin/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/admin/config', label: 'Configurações', icon: Settings },
]

function pageTitle(pathname: string) {
  if (pathname.startsWith('/admin/produtos')) return 'Produtos'
  if (pathname.startsWith('/admin/pedidos')) return 'Pedidos'
  if (pathname.startsWith('/admin/financeiro')) return 'Financeiro'
  if (pathname.startsWith('/admin/config')) return 'Configurações'
  return 'Dashboard'
}

export function AdminLayout() {
  const { isAdmin, logout, pedidos, config } = useStore()
  const location = useLocation()
  const [seen, setSeen] = useState<Set<string>>(() => readSeen())
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<{
    id: string
    codigo: string
    nome: string
    total: number
  } | null>(null)
  const knownRef = useRef<Set<string> | null>(null)

  const pendentesNovos = useMemo(
    () => pedidos.filter((p) => p.status === 'pendente' && !seen.has(p.id)),
    [pedidos, seen],
  )

  const badgeCount = pendentesNovos.length
  const title = pageTitle(location.pathname)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!location.pathname.startsWith('/admin/pedidos')) return
    setSeen((prev) => {
      const next = new Set(prev)
      let changed = false
      for (const p of pedidos) {
        if (!next.has(p.id)) {
          next.add(p.id)
          changed = true
        }
      }
      if (changed) writeSeen(next)
      return changed ? next : prev
    })
  }, [location.pathname, pedidos])

  useEffect(() => {
    if (!isAdmin) return
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      void Notification.requestPermission()
    }
  }, [isAdmin])

  useEffect(() => {
    const ids = new Set(pedidos.map((p) => p.id))
    if (!knownRef.current) {
      knownRef.current = ids
      return
    }
    const known = knownRef.current
    const novos = pedidos.filter(
      (p) => p.status === 'pendente' && !known.has(p.id),
    )
    knownRef.current = ids

    if (!novos.length) return
    const last = novos[0]
    setToast({
      id: last.id,
      codigo: last.codigo,
      nome: last.clienteNome,
      total: last.total,
    })

    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      try {
        const n = new Notification(`Novo pedido ${last.codigo}`, {
          body: `${last.clienteNome} · ${formatBRL(last.total)}`,
          tag: last.id,
        })
        n.onclick = () => {
          window.focus()
          window.location.href = '/admin/pedidos'
        }
      } catch {
        /* ignore */
      }
    }

    const t = window.setTimeout(() => setToast(null), 8000)
    return () => window.clearTimeout(t)
  }, [pedidos])

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {links.map((l) => {
        const active = l.end
          ? location.pathname === l.to
          : location.pathname.startsWith(l.to)
        const showBadge = l.badge && badgeCount > 0
        const Icon = l.icon
        return (
          <Link
            key={l.to}
            to={l.to}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? 'bg-brand text-white shadow-sm shadow-brand/25'
                : 'text-ink/80 hover:bg-brand-soft/70 hover:text-ink'
            }`}
          >
            <Icon
              size={18}
              className={active ? 'text-white' : 'text-brand-deep'}
            />
            <span className="flex-1">{l.label}</span>
            {showBadge ? (
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                  active ? 'bg-white text-brand-deep' : 'bg-brand text-white'
                }`}
              >
                {badgeCount}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )

  const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="flex items-center gap-3 border-b border-brand-soft px-5 py-5">
        <img
          src="/logo.jpg"
          alt=""
          className="h-11 w-11 rounded-2xl object-cover ring-2 ring-brand-soft"
        />
        <div className="min-w-0">
          <p className="font-display text-xl leading-none text-ink">
            {config.nome || 'EmilliStore'}
          </p>
          <p className="mt-1 text-xs text-muted">Painel admin</p>
        </div>
      </div>

      <NavLinks onNavigate={onNavigate} />

      <div className="mt-auto space-y-1 border-t border-brand-soft p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted transition hover:bg-brand-soft/70 hover:text-ink"
        >
          <Store size={18} className="text-brand-deep" />
          Ver loja
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted transition hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={18} />
          Sair
        </button>
        <a
          href="https://wa.me/5562991389317"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 pb-2 pt-1 text-[11px] text-muted"
        >
          Desenvolvido por{' '}
          <span className="font-medium text-brand-deep underline">Odherio</span>
        </a>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#faf4f3]">
      {toast ? (
        <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4">
          <Link
            to="/admin/pedidos"
            onClick={() => setToast(null)}
            className="flex w-full max-w-md items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-lg"
          >
            <Bell className="mt-0.5 shrink-0 text-brand" size={18} />
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-semibold">
                Novo pedido {toast.codigo}
              </span>
              <span className="block text-white/75">
                {toast.nome} · {formatBRL(toast.total)}
              </span>
            </span>
            <span className="text-xs text-brand">Ver</span>
          </Link>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brand-soft/80 bg-white/95 backdrop-blur lg:flex">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-white shadow-xl animate-fade-up">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-cream text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarBody onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-brand-soft/70 bg-[#faf4f3]/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-sm ring-1 ring-brand-soft lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Admin
              </p>
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">
                {title}
              </h1>
            </div>
            {badgeCount > 0 ? (
              <Link
                to="/admin/pedidos"
                className="relative grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white shadow-sm shadow-brand/30"
                aria-label={`${badgeCount} pedidos novos`}
              >
                <Bell size={16} />
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold">
                  {badgeCount}
                </span>
              </Link>
            ) : (
              <Link
                to="/admin/pedidos"
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-muted shadow-sm ring-1 ring-brand-soft"
                aria-label="Pedidos"
              >
                <Bell size={16} />
              </Link>
            )}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
