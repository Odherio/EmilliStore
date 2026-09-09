import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultConfig, seedProdutos } from '../data/seed'
import { db } from '../lib/db'
import { storage } from '../lib/storage'
import { supabase } from '../lib/supabase'
import { lancarPedidoNoFinanceiro } from '../lib/financeiroPedido'
import { uid } from '../lib/format'
import type {
  CartItem,
  FormaPagamento,
  LojaConfig,
  Pedido,
  PedidoStatus,
  Produto,
} from '../types'

type StoreContextValue = {
  usingSupabase: boolean
  config: LojaConfig
  setConfig: (c: LojaConfig) => Promise<void>
  refreshFromServer: () => Promise<void>
  produtos: Produto[]
  saveProduto: (p: Produto) => Promise<void>
  deleteProduto: (id: string) => Promise<void>
  carrinho: CartItem[]
  addToCart: (item: CartItem) => void
  updateQty: (produtoId: string, variacaoId: string, qty: number) => void
  removeFromCart: (produtoId: string, variacaoId: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  pedidos: Pedido[]
  criarPedido: (
    pedido: Omit<Pedido, 'id' | 'codigo' | 'criadoEm' | 'status'>,
  ) => Promise<Pedido>
  updatePedidoStatus: (
    id: string,
    status: PedidoStatus,
    opts?: { forma?: FormaPagamento },
  ) => Promise<void>
  deletePedido: (id: string) => Promise<void>
  isAdmin: boolean
  login: (
    emailOrPassword: string,
    password?: string,
  ) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
  uploadImagem?: (file: File) => Promise<string>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<LojaConfig>(defaultConfig)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<CartItem[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(false)
  const usingSupabase = db.enabled

  const refreshFromServer = useCallback(async () => {
    if (!db.enabled) return
    const [remoteConfig, remoteProdutos, remotePedidos] = await Promise.all([
      db.fetchConfig(),
      db.fetchProdutos(),
      db.fetchPedidos(),
    ])
    if (remoteConfig) setConfigState(remoteConfig)
    setProdutos(remoteProdutos)
    setPedidos(remotePedidos)
  }, [])

  useEffect(() => {
    let cancelled = false

    // Mostra a loja na hora (layout local); sincroniza Supabase em seguida.
    setCarrinho(storage.getCarrinho() as CartItem[])
    const cfg = storage.getConfig()
    const merged: LojaConfig = {
      ...defaultConfig,
      ...(cfg ?? {}),
      frete: { ...defaultConfig.frete, ...(cfg?.frete ?? {}) },
      bannerSlides:
        cfg?.bannerSlides?.length
          ? cfg.bannerSlides
          : defaultConfig.bannerSlides,
      bannerIntervalMs:
        cfg?.bannerIntervalMs ?? defaultConfig.bannerIntervalMs,
    }
    const prods = storage.getProdutos()
    const initialProdutos = prods.length ? prods : seedProdutos()
    if (!prods.length) storage.setProdutos(initialProdutos)
    storage.setConfig(merged)
    setConfigState(merged)
    setProdutos(initialProdutos)
    setPedidos(storage.getPedidos())
    setIsAdmin(storage.isAdmin())
    setReady(true)

    async function syncRemote() {
      if (!db.enabled) return
      try {
        const [remoteConfig, remoteProdutos, remotePedidos, session] =
          await Promise.all([
            db.fetchConfig(),
            db.fetchProdutos(),
            db.fetchPedidos(),
            db.getSession(),
          ])
        if (cancelled) return
        if (remoteConfig) setConfigState(remoteConfig)
        if (remoteProdutos.length) setProdutos(remoteProdutos)
        setPedidos(remotePedidos)
        setIsAdmin(session)
      } catch (err) {
        console.error('Falha ao sincronizar Supabase:', err)
      }
    }

    void syncRemote()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('loja-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loja_config' },
        () => {
          void refreshFromServer()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          void refreshFromServer()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produto_variacoes' },
        () => {
          void refreshFromServer()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => {
          void refreshFromServer()
        },
      )
      .subscribe()

    const onFocus = () => {
      void refreshFromServer()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      void supabase?.removeChannel(channel)
      window.removeEventListener('focus', onFocus)
    }
  }, [refreshFromServer])

  const setConfig = useCallback(async (c: LojaConfig) => {
    setConfigState(c)
    if (db.enabled) await db.saveConfig(c)
    else storage.setConfig(c)
  }, [])

  const saveProduto = useCallback(async (p: Produto) => {
    setProdutos((prev) => {
      const exists = prev.some((x) => x.id === p.id)
      const next = exists
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [p, ...prev]
      if (!db.enabled) storage.setProdutos(next)
      return next
    })
    if (db.enabled) await db.saveProduto(p)
  }, [])

  const deleteProduto = useCallback(async (id: string) => {
    setProdutos((prev) => {
      const next = prev.filter((x) => x.id !== id)
      if (!db.enabled) storage.setProdutos(next)
      return next
    })
    if (db.enabled) await db.deleteProduto(id)
  }, [])

  const addToCart = useCallback((item: CartItem) => {
    setCarrinho((prev) => {
      const idx = prev.findIndex(
        (x) =>
          x.produto_id === item.produto_id &&
          x.variacao_id === item.variacao_id,
      )
      const next =
        idx >= 0
          ? prev.map((x, i) =>
              i === idx
                ? { ...x, quantidade: x.quantidade + item.quantidade }
                : x,
            )
          : [...prev, item]
      storage.setCarrinho(next)
      return next
    })
  }, [])

  const updateQty = useCallback(
    (produtoId: string, variacaoId: string, qty: number) => {
      setCarrinho((prev) => {
        const next =
          qty <= 0
            ? prev.filter(
                (x) =>
                  !(
                    x.produto_id === produtoId && x.variacao_id === variacaoId
                  ),
              )
            : prev.map((x) =>
                x.produto_id === produtoId && x.variacao_id === variacaoId
                  ? { ...x, quantidade: qty }
                  : x,
              )
        storage.setCarrinho(next)
        return next
      })
    },
    [],
  )

  const removeFromCart = useCallback(
    (produtoId: string, variacaoId: string) => {
      setCarrinho((prev) => {
        const next = prev.filter(
          (x) =>
            !(x.produto_id === produtoId && x.variacao_id === variacaoId),
        )
        storage.setCarrinho(next)
        return next
      })
    },
    [],
  )

  const clearCart = useCallback(() => {
    setCarrinho([])
    storage.setCarrinho([])
  }, [])

  const criarPedido = useCallback(
    async (data: Omit<Pedido, 'id' | 'codigo' | 'criadoEm' | 'status'>) => {
      let pedido: Pedido

      if (db.enabled) {
        pedido = await db.createPedido(data)
      } else {
        pedido = {
          ...data,
          id: uid('ped'),
          codigo: `EM${Date.now().toString().slice(-6)}`,
          criadoEm: new Date().toISOString(),
          status: 'pendente',
        }
        setPedidos((prev) => {
          const next = [pedido, ...prev]
          storage.setPedidos(next)
          return next
        })
      }

      setPedidos((prev) => {
        if (prev.some((p) => p.id === pedido.id)) return prev
        const next = [pedido, ...prev]
        if (!db.enabled) storage.setPedidos(next)
        return next
      })

      setProdutos((prev) => {
        const next = prev.map((p) => {
          const touched = data.itens.filter((i) => i.produto_id === p.id)
          if (!touched.length) return p
          return {
            ...p,
            variacoes: p.variacoes.map((v) => {
              const item = touched.find((i) => i.variacao_id === v.id)
              if (!item) return v
              return {
                ...v,
                estoque: Math.max(0, v.estoque - item.quantidade),
              }
            }),
          }
        })
        if (!db.enabled) storage.setProdutos(next)
        return next
      })

      return pedido
    },
    [],
  )

  const updatePedidoStatus = useCallback(
    async (
      id: string,
      status: PedidoStatus,
      opts?: { forma?: FormaPagamento },
    ) => {
      const atual = pedidos.find((p) => p.id === id)
      setPedidos((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, status } : p))
        if (!db.enabled) storage.setPedidos(next)
        return next
      })
      if (db.enabled) await db.updatePedidoStatus(id, status)

      if (
        status === 'confirmado' &&
        atual &&
        atual.status !== 'confirmado' &&
        atual.total > 0
      ) {
        try {
          await lancarPedidoNoFinanceiro(atual, opts?.forma ?? 'pix')
        } catch (err) {
          console.error('Falha ao lançar pedido no financeiro:', err)
        }
      }
    },
    [pedidos],
  )

  const deletePedido = useCallback(async (id: string) => {
    setPedidos((prev) => {
      const next = prev.filter((p) => p.id !== id)
      if (!db.enabled) storage.setPedidos(next)
      return next
    })
    if (db.enabled) await db.deletePedido(id)
  }, [])

  const login = useCallback(async (emailOrPassword: string, password?: string) => {
    if (db.enabled) {
      const email = password ? emailOrPassword : ''
      const pass = password ?? emailOrPassword
      if (!email.includes('@')) {
        return {
          ok: false,
          message: 'Informe o e-mail do usuário criado no Supabase Auth.',
        }
      }
      const result = await db.login(email.trim(), pass)
      if (result.ok) setIsAdmin(true)
      return result
    }
    if (emailOrPassword.trim() === 'emilli' || password === 'emilli') {
      storage.setAdmin(true)
      setIsAdmin(true)
      return { ok: true }
    }
    return { ok: false, message: 'Senha incorreta. Use: emilli' }
  }, [])

  const logout = useCallback(async () => {
    if (db.enabled) await db.logout()
    storage.setAdmin(false)
    setIsAdmin(false)
  }, [])

  const uploadImagem = useCallback(async (file: File) => {
    if (db.enabled) return db.uploadImagem(file)
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
      reader.readAsDataURL(file)
    })
  }, [])

  const cartCount = useMemo(
    () => carrinho.reduce((s, i) => s + i.quantidade, 0),
    [carrinho],
  )
  const cartTotal = useMemo(
    () => carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0),
    [carrinho],
  )

  const value: StoreContextValue = {
    usingSupabase,
    config,
    setConfig,
    refreshFromServer,
    produtos,
    saveProduto,
    deleteProduto,
    carrinho,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    pedidos,
    criarPedido,
    updatePedidoStatus,
    deletePedido,
    isAdmin,
    login,
    logout,
    uploadImagem,
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-muted">
        Carregando EmilliStore…
      </div>
    )
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore fora do StoreProvider')
  return ctx
}
