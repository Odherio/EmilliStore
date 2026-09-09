import { db } from './db'
import { uid } from './format'
import { storage } from './storage'
import type { FormaPagamento, Lancamento, Pedido } from '../types'

const formaLabel: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
}

/** Cria entrada financeira do pedido (1x), se ainda não existir. */
export async function lancarPedidoNoFinanceiro(
  pedido: Pedido,
  forma: FormaPagamento,
): Promise<Lancamento | null> {
  if (pedido.total <= 0) return null

  const existentes = db.enabled
    ? await db.fetchLancamentos()
    : storage.getLancamentos()

  if (existentes.some((l) => l.pedidoId === pedido.id && l.tipo === 'entrada')) {
    return null
  }

  const payload = {
    tipo: 'entrada' as const,
    forma,
    valor: Number(pedido.total),
    descricao: `Pedido ${pedido.codigo} · ${pedido.clienteNome} · ${formaLabel[forma]}`,
    pedidoId: pedido.id,
    pedidoCodigo: pedido.codigo,
  }

  let created: Lancamento
  if (db.enabled) {
    created = await db.createLancamento(payload)
  } else {
    created = {
      ...payload,
      id: uid('fin'),
      criadoEm: new Date().toISOString(),
    }
  }

  const next = [created, ...existentes.filter((l) => l.id !== created.id)]
  storage.setLancamentos(next)
  return created
}
