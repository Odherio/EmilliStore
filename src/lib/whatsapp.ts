import type { Pedido } from '../types'
import { formatBRL } from './format'

export function buildWhatsappMessage(pedido: Pedido, lojaNome: string) {
  const linhas: string[] = []
  linhas.push(`*Novo pedido ${pedido.codigo} — ${lojaNome}*`)
  linhas.push('')
  linhas.push(`Cliente: ${pedido.clienteNome}`)
  linhas.push(`WhatsApp: ${pedido.clienteWhatsapp}`)
  if (pedido.clienteEmail) linhas.push(`E-mail: ${pedido.clienteEmail}`)
  linhas.push('')
  linhas.push('*Itens:*')
  for (const item of pedido.itens) {
    linhas.push(
      `• ${item.quantidade}x ${item.nome} (${item.variacao}) — ${formatBRL(item.preco * item.quantidade)}`,
    )
  }
  linhas.push('')
  linhas.push(
    `Entrega: ${pedido.tipoEntrega === 'retirada' ? 'Retirar na loja' : 'Entrega'}`,
  )
  if (pedido.tipoEntrega === 'entrega' && pedido.endereco) {
    const e = pedido.endereco
    linhas.push(
      `Endereço: ${e.rua}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ''} — ${e.bairro} — ${e.cidade}/${e.uf} CEP ${e.cep}`,
    )
    if (e.referencia) linhas.push(`Ref.: ${e.referencia}`)
    if (pedido.distanciaKm != null) {
      linhas.push(`Distância: ${pedido.distanciaKm} km`)
    }
  }
  linhas.push(`Subtotal: ${formatBRL(pedido.subtotal)}`)
  linhas.push(`Taxa entrega: ${formatBRL(pedido.taxaEntrega)}`)
  linhas.push(`*Total: ${formatBRL(pedido.total)}*`)
  if (pedido.observacoes) {
    linhas.push('')
    linhas.push(`Obs.: ${pedido.observacoes}`)
  }
  return linhas.join('\n')
}

export function openWhatsapp(phoneDigits: string, message: string) {
  const digits = phoneDigits.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
