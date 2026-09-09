import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { db } from '../../lib/db'
import { formatBRL, uid } from '../../lib/format'
import { storage } from '../../lib/storage'
import type { FormaPagamento, Lancamento, TipoLancamento } from '../../types'

const formaLabel: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
}

const tipoLabel: Record<TipoLancamento, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
}

export function AdminFinanceiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [tipo, setTipo] = useState<TipoLancamento>('entrada')
  const [forma, setForma] = useState<FormaPagamento>('pix')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      if (db.enabled) {
        const rows = await db.fetchLancamentos()
        setLancamentos(rows)
        storage.setLancamentos(rows)
      } else {
        setLancamentos(storage.getLancamentos())
      }
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar o financeiro. Usando dados locais.')
      setLancamentos(storage.getLancamentos())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resumo = useMemo(() => {
    const entradas = lancamentos
      .filter((l) => l.tipo === 'entrada')
      .reduce((s, l) => s + l.valor, 0)
    const saidas = lancamentos
      .filter((l) => l.tipo === 'saida')
      .reduce((s, l) => s + l.valor, 0)
    const porForma = (formaKey: FormaPagamento) => {
      const lista = lancamentos.filter((l) => l.forma === formaKey)
      const ent = lista
        .filter((l) => l.tipo === 'entrada')
        .reduce((s, l) => s + l.valor, 0)
      const sai = lista
        .filter((l) => l.tipo === 'saida')
        .reduce((s, l) => s + l.valor, 0)
      return { entrada: ent, saida: sai, saldo: ent - sai }
    }
    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      dinheiro: porForma('dinheiro'),
      cartao: porForma('cartao'),
      pix: porForma('pix'),
    }
  }, [lancamentos])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const v = Number(valor)
    if (!Number.isFinite(v) || v <= 0) return
    setSaving(true)
    setErro('')
    try {
      const payload = {
        tipo,
        forma,
        valor: v,
        descricao: descricao.trim() || `${tipoLabel[tipo]} · ${formaLabel[forma]}`,
      }
      let created: Lancamento
      if (db.enabled) {
        created = await db.createLancamento(payload)
      } else {
        created = {
          ...payload,
          id: uid('fin'),
          criadoEm: new Date().toISOString(),
        }
      }
      const next = [created, ...lancamentos]
      setLancamentos(next)
      storage.setLancamentos(next)
      setValor('')
      setDescricao('')
    } catch (err) {
      console.error(err)
      setErro('Falha ao salvar lançamento. Confira se rodou o SQL e se está logado.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return
    try {
      if (db.enabled) await db.deleteLancamento(id)
      const next = lancamentos.filter((l) => l.id !== id)
      setLancamentos(next)
      storage.setLancamentos(next)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível excluir o lançamento.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Financeiro</h1>
          <p className="text-sm text-muted">
            Entradas e saídas · Dinheiro, cartão e PIX
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full bg-brand-soft px-4 py-2 text-sm"
        >
          Atualizar
        </button>
      </div>

      {erro ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {erro}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-soft">
          <p className="text-xs uppercase tracking-wide text-muted">Entradas</p>
          <p className="mt-2 font-display text-2xl text-emerald-700">
            {formatBRL(resumo.entradas)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-soft">
          <p className="text-xs uppercase tracking-wide text-muted">Saídas</p>
          <p className="mt-2 font-display text-2xl text-rose-700">
            {formatBRL(resumo.saidas)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-soft">
          <p className="text-xs uppercase tracking-wide text-muted">Saldo</p>
          <p
            className={`mt-2 font-display text-2xl ${
              resumo.saldo >= 0 ? 'text-brand-deep' : 'text-rose-700'
            }`}
          >
            {formatBRL(resumo.saldo)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ['dinheiro', resumo.dinheiro],
            ['cartao', resumo.cartao],
            ['pix', resumo.pix],
          ] as const
        ).map(([key, vals]) => (
          <div
            key={key}
            className="rounded-2xl bg-cream/80 p-4 ring-1 ring-brand-soft"
          >
            <p className="text-sm font-medium">{formaLabel[key]}</p>
            <p className="mt-1 text-xs text-muted">
              Entrou {formatBRL(vals.entrada)} · Saiu {formatBRL(vals.saida)}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              Saldo {formatBRL(vals.saldo)}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-brand-soft"
      >
        <p className="font-medium">Novo lançamento</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-muted">Tipo</p>
            <div className="flex gap-2">
              {(['entrada', 'saida'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex-1 rounded-full px-3 py-2 text-sm ${
                    tipo === t
                      ? t === 'entrada'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-rose-700 text-white'
                      : 'bg-cream ring-1 ring-brand-soft'
                  }`}
                >
                  {tipoLabel[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted">Forma</p>
            <div className="flex gap-2">
              {(['dinheiro', 'cartao', 'pix'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForma(f)}
                  className={`flex-1 rounded-full px-2 py-2 text-sm ${
                    forma === f
                      ? 'bg-ink text-white'
                      : 'bg-cream ring-1 ring-brand-soft'
                  }`}
                >
                  {formaLabel[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Valor *
            <input
              type="number"
              min={0.01}
              step={0.01}
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
              placeholder="0,00"
            />
          </label>
          <label className="block text-sm">
            Descrição
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
              placeholder="Ex.: venda balcão, aluguel…"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Lançar'}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="font-display text-xl">Lançamentos</h2>
        {loading ? (
          <p className="text-sm text-muted">Carregando…</p>
        ) : !lancamentos.length ? (
          <p className="text-sm text-muted">Nenhum lançamento ainda.</p>
        ) : (
          <ul className="space-y-2">
            {lancamentos.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-brand-soft"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    <span
                      className={
                        l.tipo === 'entrada' ? 'text-emerald-700' : 'text-rose-700'
                      }
                    >
                      {l.tipo === 'entrada' ? '+' : '−'}
                      {formatBRL(l.valor)}
                    </span>
                    <span className="ml-2 text-sm text-muted">
                      {formaLabel[l.forma]}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted">{l.descricao}</p>
                  <p className="text-xs text-muted">
                    {new Date(l.criadoEm).toLocaleString('pt-BR')}
                    {l.pedidoCodigo ? ` · Pedido ${l.pedidoCodigo}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onDelete(l.id)}
                  className="rounded-full px-3 py-1.5 text-xs text-rose-700 ring-1 ring-rose-200"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
