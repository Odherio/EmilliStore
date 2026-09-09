import { useMemo, useState } from 'react'
import { useStore } from '../../context/StoreContext'
import { printEtiqueta, printEtiquetas } from '../../lib/etiqueta'
import { formatBRL } from '../../lib/format'
import { buildWhatsappMessage, openWhatsapp } from '../../lib/whatsapp'
import type { FormaPagamento, Pedido, PedidoStatus } from '../../types'

const statusLabel: Record<PedidoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_entrega: 'Em entrega',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

const formaLabel: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
}

export function AdminPedidos() {
  const { pedidos, updatePedidoStatus, deletePedido, config } = useStore()
  const [confirmando, setConfirmando] = useState<Pedido | null>(null)
  const [forma, setForma] = useState<FormaPagamento>('pix')
  const [salvando, setSalvando] = useState(false)

  const pendentes = useMemo(
    () => pedidos.filter((x) => x.status === 'pendente'),
    [pedidos],
  )

  const onStatusChange = (p: Pedido, status: PedidoStatus) => {
    if (status === 'confirmado' && p.status !== 'confirmado') {
      setForma('pix')
      setConfirmando(p)
      return
    }
    void updatePedidoStatus(p.id, status)
  }

  const confirmar = async () => {
    if (!confirmando) return
    setSalvando(true)
    try {
      await updatePedidoStatus(confirmando.id, 'confirmado', { forma })
      setConfirmando(null)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {pendentes.length > 0 ? (
            <p className="text-sm text-brand-deep">
              {pendentes.length} pendente{pendentes.length > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-sm text-muted">Todos os pedidos da loja</p>
          )}
        </div>
        {pendentes.length > 0 && (
          <button
            type="button"
            onClick={() => printEtiquetas(pendentes, config)}
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
              className={`rounded-3xl bg-white p-4 ring-1 ${
                p.status === 'pendente'
                  ? 'ring-brand shadow-sm shadow-brand/10'
                  : 'ring-brand-soft'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {p.codigo} · {p.clienteNome}
                    {p.status === 'pendente' ? (
                      <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Novo
                      </span>
                    ) : null}
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
                  <li key={`${i.produto_id}-${i.variacao_id}-${i.cor || ''}`}>
                    {i.quantidade}x {i.nome} ({i.variacao}
                    {i.cor ? ` · ${i.cor}` : ''})
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
                    onStatusChange(p, e.target.value as PedidoStatus)
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
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Excluir o pedido ${p.codigo}? Esta ação não pode ser desfeita.`,
                      )
                    ) {
                      void deletePedido(p.id)
                    }
                  }}
                  className="rounded-full px-3 py-1.5 text-sm text-rose-700 ring-1 ring-rose-200"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmando ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
            <h2 className="font-display text-2xl">Confirmar pedido</h2>
            <p className="mt-1 text-sm text-muted">
              {confirmando.codigo} · {formatBRL(confirmando.total)}
            </p>
            <p className="mt-3 text-sm">
              Como foi o pagamento? Isso lança automaticamente no financeiro.
            </p>
            <div className="mt-3 flex gap-2">
              {(['dinheiro', 'cartao', 'pix'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForma(f)}
                  className={`flex-1 rounded-full px-2 py-2 text-sm ${
                    forma === f
                      ? 'bg-ink text-white'
                      : 'bg-cream ring-1 ring-brand-soft'
                  }`}
                >
                  {formaLabel[f]}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmando(null)}
                className="flex-1 rounded-full border border-brand-soft py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={salvando}
                onClick={() => void confirmar()}
                className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {salvando ? 'Salvando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
