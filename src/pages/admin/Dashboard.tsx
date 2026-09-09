import {
  AlertTriangle,
  ArrowRight,
  Package,
  Plus,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatBRL } from '../../lib/format'
import type { PedidoStatus } from '../../types'

const statusLabel: Record<PedidoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_entrega: 'Em entrega',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

const statusTone: Record<PedidoStatus, string> = {
  pendente: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmado: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  em_entrega: 'bg-sky-50 text-sky-800 ring-sky-200',
  retirado: 'bg-brand-soft text-brand-deep ring-brand/20',
  cancelado: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export function AdminDashboard() {
  const { produtos, pedidos } = useStore()
  const pendentes = pedidos.filter((p) => p.status === 'pendente')
  const ativos = produtos.filter((p) => p.ativo).length
  const baixoEstoque = produtos.filter((p) =>
    p.variacoes.some((v) => v.estoque > 0 && v.estoque <= 2),
  )
  const hoje = new Date().toDateString()
  const pedidosHoje = pedidos.filter(
    (p) => new Date(p.criadoEm).toDateString() === hoje,
  )
  const totalHoje = pedidosHoje.reduce((s, p) => s + p.total, 0)
  const recentes = [...pedidos]
    .sort(
      (a, b) =>
        new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    )
    .slice(0, 5)
  const destaques = produtos.filter((p) => p.ativo).slice(0, 6)

  const cards = [
    {
      label: 'Pedidos pendentes',
      value: String(pendentes.length),
      hint: pendentes.length ? 'Aguardando confirmação' : 'Tudo em dia',
      icon: ShoppingBag,
      tone: 'from-[#f6e2e8] to-white',
      iconBg: 'bg-brand text-white',
    },
    {
      label: 'Vendas de hoje',
      value: formatBRL(totalHoje),
      hint: `${pedidosHoje.length} pedido${pedidosHoje.length === 1 ? '' : 's'}`,
      icon: Wallet,
      tone: 'from-white to-[#f3e4e4]',
      iconBg: 'bg-ink text-white',
    },
    {
      label: 'Produtos ativos',
      value: String(ativos),
      hint: `${produtos.length} no catálogo`,
      icon: Package,
      tone: 'from-white to-blush',
      iconBg: 'bg-brand-deep text-white',
    },
    {
      label: 'Estoque baixo',
      value: String(baixoEstoque.length),
      hint: baixoEstoque.length ? 'Revisar tamanhos' : 'Estoque ok',
      icon: AlertTriangle,
      tone: 'from-amber-50 to-white',
      iconBg: 'bg-amber-500 text-white',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            Resumo da loja ·{' '}
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-deep"
          >
            <Plus size={16} />
            Novo produto
          </Link>
          <Link
            to="/admin/pedidos"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-ink ring-1 ring-brand-soft transition hover:bg-brand-soft/40"
          >
            Ver pedidos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className={`rounded-3xl bg-gradient-to-br p-5 shadow-sm ring-1 ring-brand-soft/80 ${c.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {c.label}
                  </p>
                  <p className="mt-2 font-display text-3xl leading-none text-ink">
                    {c.value}
                  </p>
                  <p className="mt-2 text-xs text-muted">{c.hint}</p>
                </div>
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${c.iconBg}`}
                >
                  <Icon size={18} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-soft/80 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-ink">
                Pedidos recentes
              </h2>
              <p className="text-sm text-muted">Últimos pedidos da loja</p>
            </div>
            <Link
              to="/admin/pedidos"
              className="text-sm font-medium text-brand-deep underline-offset-2 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {!recentes.length ? (
            <p className="rounded-2xl bg-cream px-4 py-8 text-center text-sm text-muted">
              Nenhum pedido ainda.
            </p>
          ) : (
            <ul className="divide-y divide-brand-soft/70">
              {recentes.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{p.codigo}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${statusTone[p.status]}`}
                      >
                        {statusLabel[p.status]}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted">
                      {p.clienteNome} ·{' '}
                      {p.tipoEntrega === 'retirada' ? 'Retirada' : 'Entrega'} ·{' '}
                      {new Date(p.criadoEm).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="font-semibold text-brand-deep">
                    {formatBRL(p.total)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-soft/80 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-ink">Catálogo</h2>
              <p className="text-sm text-muted">Produtos em destaque</p>
            </div>
            <Link
              to="/admin/produtos"
              className="text-sm font-medium text-brand-deep underline-offset-2 hover:underline"
            >
              Gerenciar
            </Link>
          </div>

          {!destaques.length ? (
            <p className="rounded-2xl bg-cream px-4 py-8 text-center text-sm text-muted">
              Cadastre o primeiro produto.
            </p>
          ) : (
            <ul className="space-y-3">
              {destaques.map((p) => {
                const estoque = p.variacoes.reduce((s, v) => s + v.estoque, 0)
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl bg-cream/80 p-2.5"
                  >
                    <img
                      src={p.imagem}
                      alt=""
                      className="h-14 w-12 rounded-xl object-cover ring-1 ring-brand-soft"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {p.nome}
                      </p>
                      <p className="text-xs text-muted">
                        {formatBRL(p.preco)} · {estoque} un.
                        {p.cores?.length
                          ? ` · ${p.cores.length} cor${p.cores.length > 1 ? 'es' : ''}`
                          : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {baixoEstoque.length > 0 ? (
            <div className="mt-4 rounded-2xl bg-amber-50 px-3 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              <p className="font-medium">
                {baixoEstoque.length} produto
                {baixoEstoque.length > 1 ? 's' : ''} com estoque baixo
              </p>
              <p className="mt-0.5 text-xs text-amber-800/80">
                {baixoEstoque
                  .slice(0, 3)
                  .map((p) => p.nome)
                  .join(', ')}
                {baixoEstoque.length > 3 ? '…' : ''}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
