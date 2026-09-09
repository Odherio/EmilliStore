import { Trash2, Upload } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useStore } from '../../context/StoreContext'
import { formatBRL, uid } from '../../lib/format'
import { normalizeProdutoMidias } from '../../lib/produtoMidia'
import type { Produto, ProdutoMidia, Variacao } from '../../types'

const emptyForm = (): Omit<Produto, 'id'> & { id?: string } => ({
  nome: '',
  descricao: '',
  marca: 'Emilli',
  categoria: 'Vestidos',
  preco: 0,
  imagem: '',
  midias: [],
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
  const [uploading, setUploading] = useState(false)

  const titulo = editingId ? 'Editar produto' : 'Novo produto'
  const midias = form.midias ?? []

  const syncCapa = (list: ProdutoMidia[]) => {
    const { imagem, midias: next } = normalizeProdutoMidias({
      imagem: '',
      midias: list,
    })
    setForm((f) => ({ ...f, imagem, midias: next }))
  }

  const onPickFiles = async (
    files: FileList | null,
    tipo: 'imagem' | 'video',
  ) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const added: ProdutoMidia[] = []
      for (const file of Array.from(files)) {
        let url = ''
        if (uploadImagem) {
          url = await uploadImagem(file)
        } else {
          url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
            reader.readAsDataURL(file)
          })
        }
        added.push({ id: uid('mid'), tipo, url })
      }
      syncCapa([...midias, ...added])
    } finally {
      setUploading(false)
    }
  }

  const removeMidia = (id: string) => {
    syncCapa(midias.filter((m) => m.id !== id))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { imagem, midias: normalized } = normalizeProdutoMidias(form)
    if (!form.nome.trim() || !imagem || form.preco <= 0) return
    setSaving(true)
    try {
      const produto: Produto = {
        id: editingId ?? uid('prod'),
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        marca: form.marca.trim() || 'Emilli',
        categoria: form.categoria.trim() || 'Geral',
        preco: Number(form.preco),
        imagem,
        midias: normalized,
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
    const { imagem, midias: m } = normalizeProdutoMidias(p)
    setEditingId(p.id)
    setForm({ ...p, imagem, midias: m })
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
                {p.variacoes.reduce((s, v) => s + v.estoque, 0)} un. ·{' '}
                {(p.midias?.length || 1)} mídia(s)
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

              <div className="space-y-2 rounded-2xl bg-cream/80 p-3 ring-1 ring-brand-soft">
                <p className="text-sm font-medium">Fotos e vídeo *</p>
                <p className="text-xs text-muted">
                  Pode enviar várias fotos. Opcional: 1 vídeo. A primeira foto
                  vira capa na vitrine.
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-medium ring-1 ring-brand-soft">
                    <Upload size={14} />
                    Fotos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        void onPickFiles(e.target.files, 'imagem')
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-medium ring-1 ring-brand-soft">
                    <Upload size={14} />
                    Vídeo
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        void onPickFiles(e.target.files, 'video')
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
                {uploading ? (
                  <p className="text-xs text-muted">Enviando mídia…</p>
                ) : null}
                {midias.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {midias.map((m, idx) => (
                      <div
                        key={m.id}
                        className="relative overflow-hidden rounded-xl bg-white ring-1 ring-brand-soft"
                      >
                        {m.tipo === 'video' ? (
                          <video
                            src={m.url}
                            className="aspect-square w-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={m.url}
                            alt=""
                            className="aspect-square w-full object-cover"
                          />
                        )}
                        <span className="absolute left-1 top-1 rounded bg-ink/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                          {idx === 0 && m.tipo === 'imagem'
                            ? 'Capa'
                            : m.tipo === 'video'
                              ? 'Vídeo'
                              : 'Foto'}
                        </span>
                        <button
                          type="button"
                          aria-label="Remover"
                          onClick={() => removeMidia(m.id)}
                          className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-rose-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-600">
                    Adicione ao menos uma foto.
                  </p>
                )}
              </div>

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
                    + tamanho
                  </button>
                </div>
                <p className="mb-2 text-xs text-muted">
                  Toque para adicionar vários tamanhos de uma vez:
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {[
                    'PP',
                    'P',
                    'M',
                    'G',
                    'GG',
                    'XG',
                    'Único',
                    '34',
                    '36',
                    '38',
                    '40',
                    '42',
                    '44',
                    '46',
                  ].map((nome) => {
                    const existe = form.variacoes.some(
                      (v) => v.nome.toUpperCase() === nome.toUpperCase(),
                    )
                    return (
                      <button
                        key={nome}
                        type="button"
                        disabled={existe}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            variacoes: [
                              ...f.variacoes.filter((v) => v.nome.trim()),
                              { id: uid('var'), nome, estoque: 1 },
                            ],
                          }))
                        }
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          existe
                            ? 'bg-brand/20 text-brand-deep'
                            : 'bg-white text-ink ring-1 ring-brand-soft hover:bg-brand-soft'
                        }`}
                      >
                        {existe ? `✓ ${nome}` : `+ ${nome}`}
                      </button>
                    )
                  })}
                </div>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-brand-soft"
                    onClick={() => {
                      const pack = ['PP', 'P', 'M', 'G', 'GG']
                      setForm((f) => {
                        const nomes = new Set(
                          f.variacoes.map((v) => v.nome.toUpperCase()),
                        )
                        const extras = pack
                          .filter((n) => !nomes.has(n.toUpperCase()))
                          .map((nome) => ({
                            id: uid('var'),
                            nome,
                            estoque: 1,
                          }))
                        return {
                          ...f,
                          variacoes: [
                            ...f.variacoes.filter((v) => v.nome.trim()),
                            ...extras,
                          ],
                        }
                      })
                    }}
                  >
                    Pacote PP–GG
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-brand-soft"
                    onClick={() => {
                      const pack = ['34', '36', '38', '40', '42', '44']
                      setForm((f) => {
                        const nomes = new Set(
                          f.variacoes.map((v) => v.nome.toUpperCase()),
                        )
                        const extras = pack
                          .filter((n) => !nomes.has(n))
                          .map((nome) => ({
                            id: uid('var'),
                            nome,
                            estoque: 1,
                          }))
                        return {
                          ...f,
                          variacoes: [
                            ...f.variacoes.filter((v) => v.nome.trim()),
                            ...extras,
                          ],
                        }
                      })
                    }}
                  >
                    Pacote 34–44
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
                        title="Estoque"
                        value={v.estoque}
                        onChange={(e) =>
                          updateVar(v.id, {
                            estoque: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded-xl border border-brand-soft bg-cream px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        aria-label="Remover tamanho"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            variacoes: f.variacoes.filter((x) => x.id !== v.id),
                          }))
                        }
                        className="rounded-xl px-2 text-rose-600 ring-1 ring-rose-200"
                      >
                        <Trash2 size={14} />
                      </button>
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
                disabled={saving || !midias.some((m) => m.tipo === 'imagem')}
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
