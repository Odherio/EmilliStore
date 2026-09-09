export type Variacao = {
  id: string
  nome: string
  estoque: number
}

export type ProdutoMidia = {
  id: string
  tipo: 'imagem' | 'video'
  url: string
}

export type Produto = {
  id: string
  nome: string
  descricao: string
  marca: string
  categoria: string
  preco: number
  /** Capa (primeira imagem) — usada em card/carrinho */
  imagem: string
  midias: ProdutoMidia[]
  ativo: boolean
  destaque: boolean
  promocao: boolean
  lancamento: boolean
  variacoes: Variacao[]
}

export type CartItem = {
  produto_id: string
  variacao_id: string
  nome: string
  variacao: string
  imagem: string
  preco: number
  quantidade: number
}

export type TipoEntrega = 'retirada' | 'entrega'

export type Endereco = {
  rua: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  referencia: string
  lat?: number
  lng?: number
}

export type PedidoStatus =
  | 'pendente'
  | 'confirmado'
  | 'em_entrega'
  | 'retirado'
  | 'cancelado'

export type Pedido = {
  id: string
  codigo: string
  criadoEm: string
  clienteNome: string
  clienteWhatsapp: string
  clienteEmail: string
  observacoes: string
  tipoEntrega: TipoEntrega
  endereco?: Endereco
  distanciaKm?: number
  taxaEntrega: number
  subtotal: number
  total: number
  status: PedidoStatus
  itens: CartItem[]
}

export type FreteConfig = {
  taxaBase: number
  precoPorKm: number
  raioMaxKm: number
  freteGratisAcima: number
}

export type BannerSlide = {
  id: string
  tipo: 'imagem' | 'video'
  url: string
  eyebrow: string
  titulo: string
  tituloDestaque: string
  subtitulo: string
}

export type LojaConfig = {
  nome: string
  slug: string
  whatsapp: string
  enderecoLoja: string
  lat: number
  lng: number
  /** @deprecated use bannerSlides */
  capaUrl: string
  heroEyebrow: string
  heroTitulo: string
  heroTituloDestaque: string
  heroSubtitulo: string
  bannerSlides: BannerSlide[]
  bannerIntervalMs: number
  frete: FreteConfig
}
