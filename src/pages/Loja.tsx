import { MessageCircle, Search, ShoppingBag, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { CheckoutSheet } from '../components/CheckoutSheet'
import { HeroBanner } from '../components/HeroBanner'
import { useStore } from '../context/StoreContext'
import { formatBRL } from '../lib/format'
import type { Produto } from '../types'

export function LojaPage() {
  const { produtos, config, addToCart, cartCount, cartTotal } = useStore()
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Tudo')
  const [marca, setMarca] = useState('Todas')
  const [produtoAtivo, setProdutoAtivo] = useState<Produto | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const ativos = useMemo(
    () => produtos.filter((p) => p.ativo && p.variacoes.some((v) => v.estoque > 0)),
    [produtos],
  )

  const categorias = useMemo(
    () => ['Tudo', ...Array.from(new Set(ativos.map((p) => p.categoria)))],
    [ativos],
  )
  const marcas = useMemo(
    () => ['Todas', ...Array.from(new Set(ativos.map((p) => p.marca)))],
    [ativos],
  )

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return ativos.filter((p) => {
      if (categoria !== 'Tudo' && p.categoria !== categoria) return false
      if (marca !== 'Todas' && p.marca !== marca) return false
      if (!q) return true
      return (
        p.nome.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      )
    })
  }, [ativos, busca, categoria, marca])

  const wa = config.whatsapp.replace(/\D/g, '')
  const waUrl = `https://wa.me/55${wa.startsWith('55') ? wa.slice(2) : wa}`

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="sticky top-0 z-40 border-b border-brand-soft/80 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <img
            src="/logo.jpg"
            alt="EmilliStore"
            className="h-14 w-14 rounded-full object-cover shadow-sm ring-2 ring-white"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-semibold leading-none text-ink sm:text-3xl">
              EmilliStore
            </p>
            <p className="text-xs text-muted">Moda feminina</p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden flex-col items-center text-[10px] text-muted sm:flex"
          >
            <MessageCircle className="text-brand-deep" size={18} />
            WhatsApp
          </a>
          <div className="hidden flex-col items-center text-[10px] text-muted sm:flex">
            <Shield className="text-brand-deep" size={18} />
            Segura
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex flex-col items-center text-[10px] text-muted"
          >
            <ShoppingBag className="text-brand-deep" size={18} />
            Carrinho
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <div className="pt-4">
        <HeroBanner config={config} />
      </div>

      <main className="mx-auto max-w-6xl px-4 pt-6">
        <label className="relative mb-4 block max-w-lg">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="O que você procura?"
            className="w-full rounded-full border border-brand-soft bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
          />
        </label>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                categoria === c
                  ? 'bg-brand text-white'
                  : 'bg-white text-ink ring-1 ring-brand-soft'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {marcas.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMarca(m)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                marca === m
                  ? 'bg-brand-deep text-white'
                  : 'bg-white text-ink ring-1 ring-brand-soft'
              }`}
            >
              {m === 'Todas' ? 'Todas as marcas' : m}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <p className="py-16 text-center text-muted">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtrados.map((p) => (
              <ProductCard
                key={p.id}
                produto={p}
                onClick={() => setProdutoAtivo(p)}
              />
            ))}
          </div>
        )}

        <p className="mt-10 pb-4 text-center text-xs text-muted">
          <Link to="/admin" className="underline hover:text-brand-deep">
            Área admin
          </Link>
        </p>
      </main>

      {cartCount > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full max-w-md items-center justify-between rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 hover:bg-brand-deep"
          >
            <span className="rounded-full bg-white/20 px-2 py-0.5">
              {cartCount}
            </span>
            <span>Ver carrinho</span>
            <span>{formatBRL(cartTotal)}</span>
          </button>
        </div>
      ) : null}

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
