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
  enderecoLoja:
    'Rua Eugênio Armando Godoy, Quadra X2, Lote 13 — Vila Concórdia, Goiânia/GO — CEP 74770-320',
  lat: -16.66098,
  lng: -49.18812,
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
  const mk = (
    nome: string,
    descricao: string,
    categoria: string,
    preco: number,
    fotos: string[],
    flags: Partial<Produto>,
    vars: Array<[string, number]>,
  ): Produto => {
    const midias = fotos.map((url) => ({
      id: uid('mid'),
      tipo: 'imagem' as const,
      url,
    }))
    return {
      id: uid('prod'),
      nome,
      descricao,
      marca: 'Emilli',
      categoria,
      preco,
      imagem: fotos[0],
      midias,
      ativo: true,
      destaque: false,
      promocao: false,
      lancamento: false,
      ...flags,
      variacoes: vars.map(([nomeVar, estoque]) => ({
        id: uid('var'),
        nome: nomeVar,
        estoque,
      })),
    }
  }

  return [
    mk(
      'Vestido Midi Floral',
      'Vestido fluido com estampa delicada, ideal para o dia a dia.',
      'Vestidos',
      189.9,
      [img('1515372039744-b8f02a3ae446'), img('1469334031218-e382a71b716b')],
      { destaque: true, lancamento: true },
      [
        ['P', 4],
        ['M', 6],
        ['G', 2],
      ],
    ),
    mk(
      'Blusa Linho Off-White',
      'Blusa leve em linho, caimento solto e elegante.',
      'Blusas',
      119.9,
      [img('1483985988355-763728e1935b'), img('1490481651871-ab68de25d43d')],
      { promocao: true },
      [
        ['P', 3],
        ['M', 5],
        ['G', 1],
      ],
    ),
    mk(
      'Calça Wide Leg Bege',
      'Calça wide leg em alfaiataria macia.',
      'Calças',
      219.9,
      [img('1490481651871-ab68de25d43d'), img('1515372039744-b8f02a3ae446')],
      { destaque: true },
      [
        ['36', 2],
        ['38', 4],
        ['40', 3],
      ],
    ),
    mk(
      'Conjunto Tricot Rosa',
      'Conjunto em tricot macio na tonalidade da marca.',
      'Conjuntos',
      249.9,
      [img('1469334031218-e382a71b716b'), img('1483985988355-763728e1935b')],
      { lancamento: true },
      [['Único', 5]],
    ),
  ]
}
