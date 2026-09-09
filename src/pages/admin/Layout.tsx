import { Bell } from 'lucide-react'
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
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/pedidos', label: 'Pedidos', badge: true },
  { to: '/admin/financeiro', label: 'Financeiro' },
  { to: '/admin/config', label: 'Configurações' },
]

export function AdminLayout() {
  const { isAdmin, logout, pedidos } = useStore()
  const location = useLocation()
  const [seen, setSeen] = useState<Set<string>>(() => readSeen())
  const [toast, setToast] = useState<{
    id: string
    codigo: string
    nome: string
    total: number
  } | null>(null)
  const knownRef = useRef<Set<string> | null>(null)

  const pendentesNovos = useMemo(
    () =>
      pedidos.filter((p) => p.status === 'pendente' && !seen.has(p.id)),
    [pedidos, seen],
  )

  const badgeCount = pendentesNovos.length

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
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
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

  return (
    <div className="min-h-screen bg-cream">
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

      <header className="border-b border-brand-soft bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="mr-auto">
            <p className="font-display text-xl leading-none">EmilliStore</p>
            <p className="text-xs text-muted">Painel admin</p>
          </div>
          {badgeCount > 0 ? (
            <Link
              to="/admin/pedidos"
              className="relative grid h-9 w-9 place-items-center rounded-full bg-brand text-white"
              aria-label={`${badgeCount} pedidos novos`}
            >
              <Bell size={16} />
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold">
                {badgeCount}
              </span>
            </Link>
          ) : null}
          <Link to="/" className="text-sm text-muted underline">
            Ver loja
          </Link>
          <a
            href="https://wa.me/5562991389317"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-xs text-muted sm:inline"
          >
            por{' '}
            <span className="font-medium text-brand-deep underline">Odherio</span>
          </a>
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
            const showBadge = l.badge && badgeCount > 0
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  active ? 'bg-brand text-white' : 'bg-cream text-ink'
                }`}
              >
                {l.label}
                {showBadge ? (
                  <span
                    className={`ml-1 inline-grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${
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
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
