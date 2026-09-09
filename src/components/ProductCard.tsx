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
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-brand-soft transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-soft">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {produto.destaque ? (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Destaque
            </span>
          ) : null}
          {produto.promocao ? (
            <span className="rounded-full bg-brand-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Promoção
            </span>
          ) : null}
          {produto.lancamento ? (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-deep">
              Lançamento
            </span>
          ) : null}
        </div>
        {estoque > 0 && estoque <= 3 ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            Últimas {estoque}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {produto.marca}
        </p>
        <h3 className="font-display text-lg leading-tight text-ink">
          {produto.nome}
        </h3>
        <p className="mt-auto text-base font-semibold text-brand-deep">
          {formatBRL(produto.preco)}
        </p>
        <p className="text-xs text-muted">
          {opcoes} {opcoes === 1 ? 'tamanho' : 'tamanhos'} · {estoque} em estoque
        </p>
      </div>
    </button>
  )
}
