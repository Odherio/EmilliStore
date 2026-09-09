import { defaultConfig } from '../data/seed'
import type {
  BannerSlide,
  CartItem,
  FreteConfig,
  LojaConfig,
  Pedido,
  PedidoStatus,
  Produto,
  ProdutoMidia,
  Variacao,
} from '../types'
import { normalizeProdutoMidias } from './produtoMidia'
import { supabase, isSupabaseConfigured } from './supabase'
import { uid } from './format'

type ProdutoRow = {
  id: string
  nome: string
  descricao: string
  marca: string
  categoria: string
  preco: number | string
  imagem: string
  midias?: ProdutoMidia[] | null
  ativo: boolean
  destaque: boolean
  promocao: boolean
  lancamento: boolean
  produto_variacoes?: Array<{ id: string; nome: string; estoque: number }>
}

type ConfigRow = {
  slug: string
  nome: string
  whatsapp: string
  endereco_loja: string
  lat: number
  lng: number
  capa_url: string
  hero_eyebrow: string
  hero_titulo: string
  hero_titulo_destaque: string
  hero_subtitulo: string
  banner_slides: BannerSlide[] | null
  banner_interval_ms: number
  frete: FreteConfig | null
}

type PedidoRow = {
  id: string
  codigo: string
  criado_em: string
  cliente_nome: string
  cliente_whatsapp: string
  cliente_email: string
  observacoes: string
  tipo_entrega: 'retirada' | 'entrega'
  endereco: Pedido['endereco']
  distancia_km: number | null
  taxa_entrega: number | string
  subtotal: number | string
  total: number | string
  status: PedidoStatus
  pedido_itens?: Array<{
    produto_id: string | null
    variacao_id: string | null
    nome: string
    variacao: string
    imagem: string
    preco: number | string
    quantidade: number
  }>
}

function mapProduto(row: ProdutoRow): Produto {
  const { imagem, midias } = normalizeProdutoMidias({
    imagem: row.imagem ?? '',
    midias: row.midias ?? [],
  })
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao ?? '',
    marca: row.marca ?? 'Emilli',
    categoria: row.categoria ?? 'Geral',
    preco: Number(row.preco),
    imagem,
    midias,
    ativo: !!row.ativo,
    destaque: !!row.destaque,
    promocao: !!row.promocao,
    lancamento: !!row.lancamento,
    variacoes: (row.produto_variacoes ?? []).map(
      (v): Variacao => ({
        id: v.id,
        nome: v.nome,
        estoque: Number(v.estoque),
      }),
    ),
  }
}

function mapConfig(row: ConfigRow): LojaConfig {
  return {
    ...defaultConfig,
    slug: row.slug,
    nome: row.nome,
    whatsapp: row.whatsapp,
    enderecoLoja: row.endereco_loja,
    lat: Number(row.lat),
    lng: Number(row.lng),
    capaUrl: row.capa_url || defaultConfig.capaUrl,
    heroEyebrow: row.hero_eyebrow || defaultConfig.heroEyebrow,
    heroTitulo: row.hero_titulo || defaultConfig.heroTitulo,
    heroTituloDestaque:
      row.hero_titulo_destaque || defaultConfig.heroTituloDestaque,
    heroSubtitulo: row.hero_subtitulo || defaultConfig.heroSubtitulo,
    bannerSlides:
      row.banner_slides?.length
        ? row.banner_slides
        : defaultConfig.bannerSlides,
    bannerIntervalMs: row.banner_interval_ms || defaultConfig.bannerIntervalMs,
    frete: { ...defaultConfig.frete, ...(row.frete ?? {}) },
  }
}

function mapPedido(row: PedidoRow): Pedido {
  return {
    id: row.id,
    codigo: row.codigo,
    criadoEm: row.criado_em,
    clienteNome: row.cliente_nome,
    clienteWhatsapp: row.cliente_whatsapp,
    clienteEmail: row.cliente_email ?? '',
    observacoes: row.observacoes ?? '',
    tipoEntrega: row.tipo_entrega,
    endereco: row.endereco ?? undefined,
    distanciaKm: row.distancia_km ?? undefined,
    taxaEntrega: Number(row.taxa_entrega),
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status,
    itens: (row.pedido_itens ?? []).map(
      (i): CartItem => ({
        produto_id: i.produto_id ?? '',
        variacao_id: i.variacao_id ?? '',
        nome: i.nome,
        variacao: i.variacao,
        imagem: i.imagem,
        preco: Number(i.preco),
        quantidade: i.quantidade,
      }),
    ),
  }
}

export const db = {
  enabled: isSupabaseConfigured,

  async fetchConfig(): Promise<LojaConfig | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('loja_config')
      .select('*')
      .eq('slug', 'emilli')
      .maybeSingle()
    if (error) throw error
    return data ? mapConfig(data as ConfigRow) : null
  },

  async saveConfig(config: LojaConfig): Promise<void> {
    if (!supabase) return
    const { error } = await supabase.from('loja_config').upsert(
      {
        slug: config.slug || 'emilli',
        nome: config.nome,
        whatsapp: config.whatsapp,
        endereco_loja: config.enderecoLoja,
        lat: config.lat,
        lng: config.lng,
        capa_url: config.capaUrl,
        hero_eyebrow: config.heroEyebrow,
        hero_titulo: config.heroTitulo,
        hero_titulo_destaque: config.heroTituloDestaque,
        hero_subtitulo: config.heroSubtitulo,
        banner_slides: config.bannerSlides,
        banner_interval_ms: config.bannerIntervalMs,
        frete: config.frete,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    if (error) throw error
  },

  async fetchProdutos(): Promise<Produto[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('produtos')
      .select('*, produto_variacoes(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return ((data ?? []) as ProdutoRow[]).map(mapProduto)
  },

  async saveProduto(produto: Produto): Promise<void> {
    if (!supabase) return

    const { imagem, midias } = normalizeProdutoMidias(produto)

    const { error: pErr } = await supabase.from('produtos').upsert({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      marca: produto.marca,
      categoria: produto.categoria,
      preco: produto.preco,
      imagem,
      midias,
      ativo: produto.ativo,
      destaque: produto.destaque,
      promocao: produto.promocao,
      lancamento: produto.lancamento,
    })
    if (pErr) throw pErr

    const { error: delErr } = await supabase
      .from('produto_variacoes')
      .delete()
      .eq('produto_id', produto.id)
    if (delErr) throw delErr

    if (produto.variacoes.length) {
      const { error: vErr } = await supabase.from('produto_variacoes').insert(
        produto.variacoes.map((v) => ({
          id: v.id,
          produto_id: produto.id,
          nome: v.nome,
          estoque: v.estoque,
        })),
      )
      if (vErr) throw vErr
    }
  },

  async deleteProduto(id: string): Promise<void> {
    if (!supabase) return
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) throw error
  },

  async fetchPedidos(): Promise<Pedido[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, pedido_itens(*)')
      .order('criado_em', { ascending: false })
    if (error) throw error
    return ((data ?? []) as PedidoRow[]).map(mapPedido)
  },

  async createPedido(
    data: Omit<Pedido, 'id' | 'codigo' | 'criadoEm' | 'status'>,
  ): Promise<Pedido> {
    if (!supabase) {
      throw new Error('Supabase não configurado')
    }

    const codigo = `EM${Date.now().toString().slice(-6)}`
    const id = crypto.randomUUID?.() ?? uid('ped')

    const { data: row, error } = await supabase
      .from('pedidos')
      .insert({
        id,
        codigo,
        cliente_nome: data.clienteNome,
        cliente_whatsapp: data.clienteWhatsapp,
        cliente_email: data.clienteEmail,
        observacoes: data.observacoes,
        tipo_entrega: data.tipoEntrega,
        endereco: data.endereco ?? null,
        distancia_km: data.distanciaKm ?? null,
        taxa_entrega: data.taxaEntrega,
        subtotal: data.subtotal,
        total: data.total,
        status: 'pendente',
      })
      .select('*')
      .single()
    if (error) throw error

    const { error: itemsErr } = await supabase.from('pedido_itens').insert(
      data.itens.map((i) => ({
        pedido_id: id,
        produto_id: i.produto_id,
        variacao_id: i.variacao_id,
        nome: i.nome,
        variacao: i.variacao,
        imagem: i.imagem,
        preco: i.preco,
        quantidade: i.quantidade,
      })),
    )
    if (itemsErr) throw itemsErr

    // baixa estoque
    for (const item of data.itens) {
      const { data: varRow } = await supabase
        .from('produto_variacoes')
        .select('estoque')
        .eq('id', item.variacao_id)
        .maybeSingle()
      if (varRow) {
        await supabase
          .from('produto_variacoes')
          .update({
            estoque: Math.max(0, Number(varRow.estoque) - item.quantidade),
          })
          .eq('id', item.variacao_id)
      }
    }

    return mapPedido({
      ...(row as PedidoRow),
      pedido_itens: data.itens.map((i) => ({
        produto_id: i.produto_id,
        variacao_id: i.variacao_id,
        nome: i.nome,
        variacao: i.variacao,
        imagem: i.imagem,
        preco: i.preco,
        quantidade: i.quantidade,
      })),
    })
  },

  async updatePedidoStatus(id: string, status: PedidoStatus): Promise<void> {
    if (!supabase) return
    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },

  async uploadImagem(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase não configurado')
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('produto-imagens')
      .upload(path, file, {
        upsert: true,
        contentType: file.type || undefined,
      })
    if (error) throw error
    const { data } = supabase.storage.from('produto-imagens').getPublicUrl(path)
    return data.publicUrl
  },

  async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    if (!supabase) return { ok: false, message: 'Supabase não configurado' }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (!error) return { ok: true }

    const msg = error.message || 'Falha no login'
    if (/confirm|confirmed|verif/i.test(msg)) {
      return {
        ok: false,
        message:
          'E-mail ainda não confirmado. No Supabase: Authentication → Users → abra o usuário → confirme o e-mail (ou marque Auto Confirm ao criar).',
      }
    }
    if (/invalid login credentials/i.test(msg)) {
      return {
        ok: false,
        message:
          'E-mail ou senha inválidos. Confira se o usuário existe em Authentication → Users e se o e-mail está confirmado.',
      }
    }
    return { ok: false, message: msg }
  },

  async logout(): Promise<void> {
    if (!supabase) return
    await supabase.auth.signOut()
  },

  async getSession(): Promise<boolean> {
    if (!supabase) return false
    const { data } = await supabase.auth.getSession()
    return !!data.session
  },
}
