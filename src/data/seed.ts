import type { BannerSlide, LojaConfig, Produto } from '../types'
import { uid } from '../lib/format'

export const defaultBannerSlides: BannerSlide[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    tipo: 'imagem',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Seleção da semana',
    titulo: 'Moda que encanta,',
    tituloDestaque: 'estilo que é você.',
    subtitulo: 'Escolha seus favoritos e receba em casa ou retire com a gente.',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    tipo: 'imagem',
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Novidades',
    titulo: 'Peças pensadas',
    tituloDestaque: 'para te destacar.',
    subtitulo: 'Looks leves, elegantes e prontos para o seu dia.',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    tipo: 'imagem',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'EmilliStore',
    titulo: 'Sinta-se linda,',
    tituloDestaque: 'em cada detalhe.',
    subtitulo: 'Retire na loja ou peça entrega no conforto da sua casa.',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    tipo: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    eyebrow: 'Bastidores',
    titulo: 'Movimento,',
    tituloDestaque: 'presença e atitude.',
    subtitulo: 'Acompanhe a EmilliStore em cada estação.',
  },
]

export const defaultConfig: LojaConfig = {
  nome: 'EmilliStore',
  slug: 'emilli',
  whatsapp: '11999999999',
  enderecoLoja: 'São Paulo, SP',
  lat: -23.5505,
  lng: -46.6333,
  capaUrl: defaultBannerSlides[0].url,
  heroEyebrow: defaultBannerSlides[0].eyebrow,
  heroTitulo: defaultBannerSlides[0].titulo,
  heroTituloDestaque: defaultBannerSlides[0].tituloDestaque,
  heroSubtitulo: defaultBannerSlides[0].subtitulo,
  bannerSlides: defaultBannerSlides,
  bannerIntervalMs: 5000,
  frete: {
    taxaBase: 8,
    precoPorKm: 2.5,
    raioMaxKm: 15,
    freteGratisAcima: 250,
  },
}

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80`

export function seedProdutos(): Produto[] {
  return [
    {
      id: uid('prod'),
      nome: 'Vestido Midi Floral',
      descricao: 'Vestido fluido com estampa delicada, ideal para o dia a dia.',
      marca: 'Emilli',
      categoria: 'Vestidos',
      preco: 189.9,
      imagem: img('1515372039744-b8f02a3ae446'),
      ativo: true,
      destaque: true,
      promocao: false,
      lancamento: true,
      variacoes: [
        { id: uid('var'), nome: 'P', estoque: 4 },
        { id: uid('var'), nome: 'M', estoque: 6 },
        { id: uid('var'), nome: 'G', estoque: 2 },
      ],
    },
    {
      id: uid('prod'),
      nome: 'Blusa Linho Off-White',
      descricao: 'Blusa leve em linho, caimento solto e elegante.',
      marca: 'Emilli',
      categoria: 'Blusas',
      preco: 119.9,
      imagem: img('1483985988355-763728e1935b'),
      ativo: true,
      destaque: false,
      promocao: true,
      lancamento: false,
      variacoes: [
        { id: uid('var'), nome: 'P', estoque: 3 },
        { id: uid('var'), nome: 'M', estoque: 5 },
        { id: uid('var'), nome: 'G', estoque: 1 },
      ],
    },
    {
      id: uid('prod'),
      nome: 'Calça Wide Leg Bege',
      descricao: 'Calça wide leg em alfaiataria macia.',
      marca: 'Emilli',
      categoria: 'Calças',
      preco: 219.9,
      imagem: img('1490481651871-ab68de25d43d'),
      ativo: true,
      destaque: true,
      promocao: false,
      lancamento: false,
      variacoes: [
        { id: uid('var'), nome: '36', estoque: 2 },
        { id: uid('var'), nome: '38', estoque: 4 },
        { id: uid('var'), nome: '40', estoque: 3 },
      ],
    },
    {
      id: uid('prod'),
      nome: 'Conjunto Tricot Rosa',
      descricao: 'Conjunto em tricot macio na tonalidade da marca.',
      marca: 'Emilli',
      categoria: 'Conjuntos',
      preco: 249.9,
      imagem: img('1469334031218-e382a71b716b'),
      ativo: true,
      destaque: false,
      promocao: false,
      lancamento: true,
      variacoes: [
        { id: uid('var'), nome: 'Único', estoque: 5 },
      ],
    },
  ]
}
