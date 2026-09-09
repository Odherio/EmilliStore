import { uid } from './format'
import type { Produto, ProdutoMidia } from '../types'

/** Garante midias[] e imagem de capa, compatível com produtos antigos. */
export function normalizeProdutoMidias(
  produto: Pick<Produto, 'imagem' | 'midias'>,
): { imagem: string; midias: ProdutoMidia[] } {
  const midias = (produto.midias ?? []).filter((m) => m.url?.trim())
  if (midias.length) {
    const capa =
      midias.find((m) => m.tipo === 'imagem')?.url ||
      midias[0].url ||
      produto.imagem ||
      ''
    return { imagem: capa, midias }
  }
  if (produto.imagem?.trim()) {
    const single: ProdutoMidia = {
      id: uid('mid'),
      tipo: 'imagem',
      url: produto.imagem,
    }
    return { imagem: produto.imagem, midias: [single] }
  }
  return { imagem: '', midias: [] }
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes('video')
}
