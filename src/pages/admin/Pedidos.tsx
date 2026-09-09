import { useStore } from '../../context/StoreContext'
import { formatBRL } from '../../lib/format'
import { buildWhatsappMessage, openWhatsapp } from '../../lib/whatsapp'
import type { PedidoStatus } from '../../types'

const statusLabel: Record<PedidoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_entrega: 'Em entrega',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

export function AdminPedidos() {
  const { pedidos, updatePedidoStatus, config } = useStore()

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Pedidos</h1>
      {!pedidos.length ? (
        <p className="text-muted">Nenhum pedido ainda.</p>
      ) : (
        <ul className="space-y-3">
          {pedidos.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl bg-white p-4 ring-1 ring-brand-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {p.codigo} · {p.clienteNome}
                  </p>
                  <p className="text-sm text-muted">{p.clienteWhatsapp}</p>
                  <p className="text-xs text-muted">
                    {new Date(p.criadoEm).toLocaleString('pt-BR')} ·{' '}
                    {p.tipoEntrega === 'retirada' ? 'Retirada' : 'Entrega'}
                  </p>
                </div>
                <p className="font-semibold text-brand-deep">
                  {formatBRL(p.total)}
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {p.itens.map((i) => (
                  <li key={`${i.produto_id}-${i.variacao_id}`}>
                    {i.quantidade}x {i.nome} ({i.variacao})
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={p.status}
                  onChange={(e) =>
                    void updatePedidoStatus(p.id, e.target.value as PedidoStatus)
                  }
                  className="rounded-full border border-brand-soft bg-cream px-3 py-1.5 text-sm"
                >
                  {(Object.keys(statusLabel) as PedidoStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsapp(
                      p.clienteWhatsapp,
                      buildWhatsappMessage(p, config.nome),
                    )
                  }
                  className="rounded-full bg-brand px-3 py-1.5 text-sm text-white"
                >
                  WhatsApp
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
