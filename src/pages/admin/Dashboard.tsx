import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatBRL } from '../../lib/format'

export function AdminDashboard() {
  const { produtos, pedidos } = useStore()
  const pendentes = pedidos.filter((p) => p.status === 'pendente').length
  const ativos = produtos.filter((p) => p.ativo).length
  const baixo = produtos.filter((p) =>
    p.variacoes.some((v) => v.estoque > 0 && v.estoque <= 2),
  ).length
  const hoje = new Date().toDateString()
  const totalHoje = pedidos
    .filter((p) => new Date(p.criadoEm).toDateString() === hoje)
    .reduce((s, p) => s + p.total, 0)

  const cards = [
    { label: 'Pedidos pendentes', value: String(pendentes) },
    { label: 'Total de hoje', value: formatBRL(totalHoje) },
    { label: 'Produtos ativos', value: String(ativos) },
    { label: 'Estoque baixo', value: String(baixo) },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft"
          >
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-2 font-display text-2xl text-brand-deep">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/admin/produtos"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          Cadastrar produto
        </Link>
        <Link
          to="/admin/pedidos"
          className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-brand-soft"
        >
          Ver pedidos
        </Link>
        <Link
          to="/admin/financeiro"
          className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-brand-soft"
        >
          Financeiro
        </Link>
      </div>
    </div>
  )
}
