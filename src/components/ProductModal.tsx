import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatBRL } from '../lib/format'
import { normalizeProdutoMidias } from '../lib/produtoMidia'
import type { Produto } from '../types'
import { Sheet } from './Sheet'

type Props = {
  produto: Produto | null
  open: boolean
  onClose: () => void
  onAdd: (payload: {
    produto_id: string
    variacao_id: string
    nome: string
    variacao: string
    imagem: string
    preco: number
    quantidade: number
  }) => void
}

export function ProductModal({ produto, open, onClose, onAdd }: Props) {
  const [variacaoId, setVariacaoId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [midiaIndex, setMidiaIndex] = useState(0)

  const midias = useMemo(() => {
    if (!produto) return []
    return normalizeProdutoMidias(produto).midias
  }, [produto])

  const selected = useMemo(
    () => produto?.variacoes.find((v) => v.id === variacaoId) ?? null,
    [produto, variacaoId],
  )

  const max = selected?.estoque ?? 1
  const current = midias[midiaIndex] ?? midias[0]

  useEffect(() => {
    setMidiaIndex(0)
    setVariacaoId(null)
    setQty(1)
  }, [produto?.id])

  if (!produto) return null

  const resetAndClose = () => {
    setVariacaoId(null)
    setQty(1)
    setMidiaIndex(0)
    onClose()
  }

  const go = (dir: -1 | 1) => {
    if (midias.length <= 1) return
    setMidiaIndex((i) => (i + dir + midias.length) % midias.length)
  }

  return (
    <Sheet
      open={open}
      onClose={resetAndClose}
      title={produto.nome}
      subtitle={produto.marca}
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Preço unitário</span>
            <span className="font-semibold text-brand-deep">
              {formatBRL(produto.preco)}
            </span>
          </div>
          {selected && selected.estoque <= 3 ? (
            <p className="text-xs font-medium text-rose-600">
              Últimas {selected.estoque} unidades neste tamanho
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-brand-soft bg-white">
              <button
                type="button"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-2 disabled:opacity-40"
                aria-label="Diminuir"
              >
                <Minus size={16} />
              </button>
              <input
                className="w-10 border-0 bg-transparent text-center outline-none"
                value={qty}
                readOnly
                aria-label="Quantidade"
              />
              <button
                type="button"
                disabled={!selected || qty >= max}
                onClick={() => setQty((q) => Math.min(max, q + 1))}
                className="p-2 disabled:opacity-40"
                aria-label="Aumentar"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                onAdd({
                  produto_id: produto.id,
                  variacao_id: selected.id,
                  nome: produto.nome,
                  variacao: selected.nome,
                  imagem: produto.imagem,
                  preco: produto.preco,
                  quantidade: qty,
                })
                resetAndClose()
              }}
              className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {selected
                ? `Adicionar · ${formatBRL(produto.preco * qty)}`
                : 'Escolha o tamanho'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-brand-soft">
          {current?.tipo === 'video' ? (
            <video
              key={current.id}
              src={current.url}
              className="aspect-[4/5] w-full object-cover"
              controls
              playsInline
              autoPlay
              muted
              loop
            />
          ) : (
            <img
              src={current?.url || produto.imagem}
              alt={produto.nome}
              className="aspect-[4/5] w-full object-cover"
            />
          )}

          {midias.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Próximo"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {midias.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-label={`Mídia ${i + 1}`}
                    onClick={() => setMidiaIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === midiaIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {midias.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {midias.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMidiaIndex(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ${
                  i === midiaIndex ? 'ring-brand' : 'ring-transparent'
                }`}
              >
                {m.tipo === 'video' ? (
                  <div className="grid h-full w-full place-items-center bg-ink text-[10px] font-semibold text-white">
                    Vídeo
                  </div>
                ) : (
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        ) : null}

        {produto.descricao ? (
          <p className="text-sm leading-relaxed text-muted">{produto.descricao}</p>
        ) : null}
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Escolha o tamanho</p>
          <div className="flex flex-wrap gap-2">
            {produto.variacoes.map((v) => {
              const disabled = v.estoque <= 0
              const active = v.id === variacaoId
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setVariacaoId(v.id)
                    setQty(1)
                  }}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-brand text-white'
                      : 'bg-brand-soft text-ink hover:bg-brand/20'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {v.nome} {disabled ? '(esgotado)' : `(${v.estoque})`}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Sheet>
  )
}
