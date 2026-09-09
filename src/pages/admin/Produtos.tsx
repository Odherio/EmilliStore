import { useMemo, useState, type FormEvent } from 'react'
import { useStore } from '../../context/StoreContext'
import { formatBRL, uid } from '../../lib/format'
import type { Produto, Variacao } from '../../types'

const emptyForm = (): Omit<Produto, 'id'> & { id?: string } => ({
  nome: '',
  descricao: '',
  marca: 'Emilli',
  categoria: 'Vestidos',
  preco: 0,
  imagem: '',
  ativo: true,
  destaque: false,
  promocao: false,
  lancamento: false,
  variacoes: [
    { id: uid('var'), nome: 'P', estoque: 1 },
    { id: uid('var'), nome: 'M', estoque: 1 },
    { id: uid('var'), nome: 'G', estoque: 1 },
  ],
})

export function AdminProdutos() {
  const { produtos, saveProduto, deleteProduto, uploadImagem } = useStore()
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const titulo = editingId ? 'Editar produto' : 'Novo produto'

  const onPickImage = async (file: File | null) => {
    if (!file || !uploadImagem) return
    const url = await uploadImagem(file)
    setForm((f) => ({ ...f, imagem: url }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.imagem || form.preco <= 0) return
    setSaving(true)
    try {
      const produto: Produto = {
        id: editingId ?? uid('prod'),
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        marca: form.marca.trim() || 'Emilli',
        categoria: form.categoria.trim() || 'Geral',
        preco: Number(form.preco),
        imagem: form.imagem,
        ativo: form.ativo,
        destaque: form.destaque,
        promocao: form.promocao,
        lancamento: form.lancamento,
        variacoes: form.variacoes.filter((v) => v.nome.trim()),
      }
      await saveProduto(produto)
      setOpen(false)
      setEditingId(null)
      setForm(emptyForm())
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p: Produto) => {
    setEditingId(p.id)
    setForm({ ...p })
    setOpen(true)
  }

  const updateVar = (id: string, patch: Partial<Variacao>) => {
    setForm((f) => ({
      ...f,
      variacoes: f.variacoes.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }))
  }

  const lista = useMemo(() => produtos, [produtos])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Produtos</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(null)
            setForm(emptyForm())
            setOpen(true)
          }}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Novo produto
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {lista.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-brand-soft"
          >
            <img
              src={p.imagem}
              alt=""
              className="h-24 w-20 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.nome}</p>
              <p className="text-sm text-brand-deep">{formatBRL(p.preco)}</p>
              <p className="text-xs text-muted">
                {p.ativo ? 'Ativo' : 'Inativo'} ·{' '}
                {p.variacoes.reduce((s, v) => s + v.estoque, 0)} un.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="text-xs underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Excluir este produto?')) void deleteProduto(p.id)
                  }}
                  className="text-xs text-rose-600 underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4">
          <form
            onSubmit={onSubmit}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
          >
            <h2 className="font-display text-2xl">{titulo}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                Nome *
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Descrição
                <textarea
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  className="mt-1 min-h-20 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  Marca
                  <input
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  Categoria
                  <input
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
                  />
                </label>
              </div>
              <label className="block text-sm">
                Preço *
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  required
                  value={form.preco || ''}
                  onChange={(e) =>
                    setForm({ ...form, preco: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Foto *
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full text-sm"
                />
              </label>
              {form.imagem ? (
                <img
                  src={form.imagem}
                  alt="Prévia"
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="flex flex-wrap gap-3 text-sm">
                {(
                  [
                    ['ativo', 'Ativo na loja'],
                    ['destaque', 'Destaque'],
                    ['promocao', 'Promoção'],
                    ['lancamento', 'Lançamento'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.checked })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Tamanhos / estoque</p>
                  <button
                    type="button"
                    className="text-xs text-brand-deep underline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        variacoes: [
                          ...f.variacoes,
                          { id: uid('var'), nome: '', estoque: 1 },
                        ],
                      }))
                    }
                  >
                    + variação
                  </button>
                </div>
                <div className="space-y-2">
                  {form.variacoes.map((v) => (
                    <div key={v.id} className="flex gap-2">
                      <input
                        placeholder="Ex.: M"
                        value={v.nome}
                        onChange={(e) =>
                          updateVar(v.id, { nome: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-brand-soft bg-cream px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.estoque}
                        onChange={(e) =>
                          updateVar(v.id, {
                            estoque: Number(e.target.value),
                          })
                        }
                        className="w-24 rounded-xl border border-brand-soft bg-cream px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-brand-soft py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
