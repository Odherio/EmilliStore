import type { Lancamento, LojaConfig, Pedido, Produto } from '../types'
import { normalizeProdutoMidias } from './produtoMidia'

const KEYS = {
  produtos: 'emilli.produtos',
  pedidos: 'emilli.pedidos',
  config: 'emilli.config',
  carrinho: 'emilli.carrinho',
  admin: 'emilli.admin',
  financeiro: 'emilli.financeiro',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeProduto(p: Produto): Produto {
  const { imagem, midias } = normalizeProdutoMidias(p)
  return { ...p, imagem, midias }
}

export const storage = {
  getProdutos: () => read<Produto[]>(KEYS.produtos, []).map(normalizeProduto),
  setProdutos: (v: Produto[]) => write(KEYS.produtos, v.map(normalizeProduto)),
  getPedidos: () => read<Pedido[]>(KEYS.pedidos, []),
  setPedidos: (v: Pedido[]) => write(KEYS.pedidos, v),
  getConfig: () => read<LojaConfig | null>(KEYS.config, null),
  setConfig: (v: LojaConfig) => write(KEYS.config, v),
  getCarrinho: () => read(KEYS.carrinho, [] as unknown[]),
  setCarrinho: (v: unknown) => write(KEYS.carrinho, v),
  getLancamentos: () => read<Lancamento[]>(KEYS.financeiro, []),
  setLancamentos: (v: Lancamento[]) => write(KEYS.financeiro, v),
  isAdmin: () => localStorage.getItem(KEYS.admin) === '1',
  setAdmin: (on: boolean) => {
    if (on) localStorage.setItem(KEYS.admin, '1')
    else localStorage.removeItem(KEYS.admin)
  },
}
