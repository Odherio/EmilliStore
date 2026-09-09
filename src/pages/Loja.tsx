import {
  Home,
  MessageCircle,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { CheckoutSheet } from '../components/CheckoutSheet'
import { HeroBanner } from '../components/HeroBanner'
import { InstagramButton } from '../components/InstagramButton'
import { useStore } from '../context/StoreContext'
import { formatBRL } from '../lib/format'
import type { Produto } from '../types'

export function LojaPage() {
  const { produtos, config, addToCart, cartCount, cartTotal } = useStore()
  const [busca, setBusca] = useState('')
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [categoria, setCategoria] = useState('Tudo')
  const [produtoAtivo, setProdutoAtivo] = useState<Produto | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const buscaRef = useRef<HTMLInputElement>(null)
  const catalogoRef = useRef<HTMLElement>(null)

  const ativos = useMemo(
    () => produtos.filter((p) => p.ativo && p.variacoes.some((v) => v.estoque > 0)),
    [produtos],
  )

  const categorias = useMemo(
    () => ['Tudo', ...Array.from(new Set(ativos.map((p) => p.categoria)))],
    [ativos],
  )

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return ativos.filter((p) => {
      if (categoria !== 'Tudo' && p.categoria !== categoria) return false
      if (!q) return true
      return (
        p.nome.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      )
    })
  }, [ativos, busca, categoria])

  const wa = config.whatsapp.replace(/\D/g, '')
  const waUrl = `https://wa.me/55${wa.startsWith('55') ? wa.slice(2) : wa}`

  const irCatalogo = () => {
    catalogoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const abrirBusca = () => {
    setBuscaAberta(true)
    irCatalogo()
    window.setTimeout(() => buscaRef.current?.focus(), 280)
  }

  return (
    <div className="min-h-screen safe-pb">
      <header className="sticky top-0 z-40 border-b border-brand-soft/60 bg-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <img
            src="/logo.jpg"
            alt="EmilliStore"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold leading-none text-ink">
              EmilliStore
            </p>
            <p className="truncate text-[11px] text-muted">Moda feminina · Goiânia</p>
          </div>
          <button
            type="button"
            onClick={abrirBusca}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-brand-soft"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-brand text-white shadow-sm"
            aria-label="Carrinho"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <HeroBanner config={config} />

      <main ref={catalogoRef} className="mx-auto max-w-6xl px-4 pt-5 animate-fade-up">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              Catálogo
            </p>
            <h2 className="font-display text-2xl text-ink">Peças para você</h2>
          </div>
          <p className="text-xs text-muted">{filtrados.length} itens</p>
        </div>

        {buscaAberta || busca ? (
          <label className="relative mb-4 block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              ref={buscaRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar peça, marca…"
              className="w-full rounded-2xl border-0 bg-white py-3 pl-10 pr-10 text-sm shadow-sm ring-1 ring-brand-soft outline-none focus:ring-brand"
            />
            <button
              type="button"
              aria-label="Fechar busca"
              onClick={() => {
                setBusca('')
                setBuscaAberta(false)
              }}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted"
            >
              <X size={16} />
            </button>
          </label>
        ) : null}

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categorias.map((c) => {
            const active = categoria === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-ink text-white shadow-md shadow-ink/15'
                    : 'bg-white/90 text-ink ring-1 ring-brand-soft'
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>

        {filtrados.length === 0 ? (
          <p className="py-16 text-center text-muted">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {filtrados.map((p) => (
              <ProductCard
                key={p.id}
                produto={p}
                onClick={() => setProdutoAtivo(p)}
              />
            ))}
          </div>
        )}

        <p className="mt-12 pb-2 text-center text-xs text-muted">
          <Link to="/admin" className="underline hover:text-brand-deep">
            Área admin
          </Link>
        </p>
        <p className="pb-6 text-center text-xs text-muted">
          Desenvolvido por{' '}
          <a
            href="https://wa.me/5562991389317"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-deep underline underline-offset-2"
          >
            Odherio
          </a>
        </p>
      </main>

      {cartCount > 0 ? (
        <div className="fixed inset-x-0 bottom-[4.75rem] z-30 flex justify-center px-4 sm:bottom-6">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full max-w-md items-center justify-between rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/35"
          >
            <span className="rounded-full bg-white/20 px-2 py-0.5">{cartCount}</span>
            <span>Ver carrinho</span>
            <span>{formatBRL(cartTotal)}</span>
          </button>
        </div>
      ) : null}

      <InstagramButton />

      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-brand-soft/80 bg-cream/95 backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-2">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-brand-deep"
          >
            <Home size={20} />
            Início
          </button>
          <button
            type="button"
            onClick={abrirBusca}
            className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-muted"
          >
            <Search size={20} />
            Buscar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-muted"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-muted"
          >
            <ShoppingBag size={20} />
            Carrinho
            {cartCount > 0 ? (
              <span className="absolute right-[22%] top-0 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </nav>

      <ProductModal
        open={!!produtoAtivo}
        produto={produtoAtivo}
        onClose={() => setProdutoAtivo(null)}
        onAdd={addToCart}
      />
      <CheckoutSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
