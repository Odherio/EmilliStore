import type { LojaConfig, Pedido, Produto } from '../types'

const KEYS = {
  produtos: 'emilli.produtos',
  pedidos: 'emilli.pedidos',
  config: 'emilli.config',
  carrinho: 'emilli.carrinho',
  admin: 'emilli.admin',
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

export const storage = {
  getProdutos: () => read<Produto[]>(KEYS.produtos, []),
  setProdutos: (v: Produto[]) => write(KEYS.produtos, v),
  getPedidos: () => read<Pedido[]>(KEYS.pedidos, []),
  setPedidos: (v: Pedido[]) => write(KEYS.pedidos, v),
  getConfig: () => read<LojaConfig | null>(KEYS.config, null),
  setConfig: (v: LojaConfig) => write(KEYS.config, v),
  getCarrinho: () => read(KEYS.carrinho, [] as unknown[]),
  setCarrinho: (v: unknown) => write(KEYS.carrinho, v),
  isAdmin: () => localStorage.getItem(KEYS.admin) === '1',
  setAdmin: (on: boolean) => {
    if (on) localStorage.setItem(KEYS.admin, '1')
    else localStorage.removeItem(KEYS.admin)
  },
}
