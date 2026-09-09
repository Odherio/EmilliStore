import { formatBRL } from '../lib/format'
import type { Produto } from '../types'

type Props = {
  produto: Produto
  onClick: () => void
}

export function ProductCard({ produto, onClick }: Props) {
  const estoque = produto.variacoes.reduce((s, v) => s + v.estoque, 0)
  const opcoes = produto.variacoes.filter((v) => v.estoque > 0).length

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col text-left outline-none"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-blush">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] group-active:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {produto.destaque ? (
            <span className="rounded-md bg-ink/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              Destaque
            </span>
          ) : null}
          {produto.promocao ? (
            <span className="rounded-md bg-brand-deep px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
              Promo
            </span>
          ) : null}
          {produto.lancamento ? (
            <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-deep">
              Novo
            </span>
          ) : null}
        </div>
        {estoque > 0 && estoque <= 3 ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-rose-700/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
            Últimas {estoque}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-0.5 pt-2.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
          {produto.marca}
        </p>
        <h3 className="line-clamp-2 font-display text-[1.05rem] leading-tight text-ink">
          {produto.nome}
        </h3>
        <p className="mt-1 text-sm font-semibold text-brand-deep">
          {formatBRL(produto.preco)}
        </p>
        <p className="text-[11px] text-muted">
          {opcoes} {opcoes === 1 ? 'tamanho' : 'tamanhos'}
        </p>
      </div>
    </button>
  )
}
