import { useStore } from '../../context/StoreContext'
import { printEtiqueta, printEtiquetas } from '../../lib/etiqueta'
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Pedidos</h1>
        {pedidos.length > 0 && (
          <button
            type="button"
            onClick={() =>
              printEtiquetas(
                pedidos.filter((x) => x.status === 'pendente'),
                config,
              )
            }
            className="rounded-full border border-brand-soft bg-white px-4 py-2 text-sm"
          >
            Etiquetas pendentes
          </button>
        )}
      </div>
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
              {p.tipoEntrega === 'entrega' && p.endereco ? (
                <p className="mt-2 text-xs text-muted">
                  {p.endereco.rua}, {p.endereco.numero}
                  {p.endereco.complemento ? ` — ${p.endereco.complemento}` : ''}{' '}
                  · {p.endereco.bairro} · {p.endereco.cidade}/{p.endereco.uf} ·
                  CEP {p.endereco.cep}
                </p>
              ) : p.tipoEntrega === 'retirada' ? (
                <p className="mt-2 text-xs text-muted">
                  Retirada: {config.enderecoLoja}
                </p>
              ) : null}
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
                  onClick={() => printEtiqueta(p, config)}
                  className="rounded-full border border-brand-deep px-3 py-1.5 text-sm text-brand-deep"
                >
                  Etiqueta
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsapp(
                      p.clienteWhatsapp,
                      buildWhatsappMessage(p, config.nome, config),
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
