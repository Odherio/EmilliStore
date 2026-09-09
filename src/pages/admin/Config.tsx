import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useStore } from '../../context/StoreContext'
import { uid } from '../../lib/format'
import type { BannerSlide } from '../../types'

function emptySlide(): BannerSlide {
  return {
    id: uid('slide'),
    tipo: 'imagem',
    url: '',
    eyebrow: 'EmilliStore',
    titulo: 'Nova coleção,',
    tituloDestaque: 'feita para você.',
    subtitulo: 'Compre com retirada ou entrega.',
  }
}

export function AdminConfig() {
  const { config, setConfig, refreshFromServer, usingSupabase } = useStore()
  const [form, setForm] = useState(config)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(config)
  }, [config])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const slides = form.bannerSlides.filter((s) => s.url.trim())
    await setConfig({
      ...form,
      bannerSlides: slides.length ? slides : form.bannerSlides,
      capaUrl: slides[0]?.url || form.capaUrl,
      heroEyebrow: slides[0]?.eyebrow || form.heroEyebrow,
      heroTitulo: slides[0]?.titulo || form.heroTitulo,
      heroTituloDestaque: slides[0]?.tituloDestaque || form.heroTituloDestaque,
      heroSubtitulo: slides[0]?.subtitulo || form.heroSubtitulo,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSlide = (id: string, patch: Partial<BannerSlide>) => {
    setForm((f) => ({
      ...f,
      bannerSlides: f.bannerSlides.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    }))
  }

  const onPickFile = (id: string, file: File | null, tipo: 'imagem' | 'video') => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateSlide(id, { url: String(reader.result), tipo })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Configurações</h1>
      <p className="text-sm text-muted">
        {usingSupabase
          ? 'Conectado ao Supabase — alterações no banco atualizam ao focar a aba.'
          : 'Modo local (sem .env do Supabase).'}
      </p>
      {usingSupabase ? (
        <button
          type="button"
          onClick={() => void refreshFromServer()}
          className="rounded-full bg-brand-soft px-4 py-2 text-sm"
        >
          Recarregar do banco
        </button>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="max-w-2xl space-y-3 rounded-2xl bg-white p-5 ring-1 ring-brand-soft"
      >
        <label className="block text-sm">
          Nome da loja
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          WhatsApp do proprietário
          <input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Endereço da loja
          <input
            value={form.enderecoLoja}
            onChange={(e) => setForm({ ...form, enderecoLoja: e.target.value })}
            className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
          />
        </label>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-medium">Banner (carrossel)</p>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                bannerSlides: [...f.bannerSlides, emptySlide()],
              }))
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-deep underline"
          >
            <Plus size={14} /> Adicionar slide
          </button>
        </div>

        <label className="block text-sm">
          Tempo entre fotos (ms)
          <input
            type="number"
            min={2000}
            step={500}
            value={form.bannerIntervalMs}
            onChange={(e) =>
              setForm({ ...form, bannerIntervalMs: Number(e.target.value) })
            }
            className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
          />
        </label>

        <div className="space-y-4">
          {form.bannerSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className="rounded-2xl border border-brand-soft bg-cream/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Slide {idx + 1}</p>
                <button
                  type="button"
                  disabled={form.bannerSlides.length <= 1}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      bannerSlides: f.bannerSlides.filter((s) => s.id !== slide.id),
                    }))
                  }
                  className="text-rose-600 disabled:opacity-30"
                  aria-label="Remover slide"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mb-3 flex gap-2">
                {(['imagem', 'video'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => updateSlide(slide.id, { tipo })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      slide.tipo === tipo
                        ? 'bg-brand text-white'
                        : 'bg-white ring-1 ring-brand-soft'
                    }`}
                  >
                    {tipo === 'imagem' ? 'Foto' : 'Vídeo'}
                  </button>
                ))}
              </div>

              <label className="mb-2 block text-sm">
                URL da {slide.tipo === 'video' ? 'vídeo' : 'imagem'}
                <input
                  value={slide.url}
                  onChange={(e) => updateSlide(slide.id, { url: e.target.value })}
                  placeholder={
                    slide.tipo === 'video'
                      ? 'https://.../video.mp4'
                      : 'https://.../foto.jpg'
                  }
                  className="mt-1 w-full rounded-xl border border-brand-soft bg-white px-3 py-2"
                />
              </label>

              <label className="mb-3 block text-sm">
                Ou enviar arquivo
                <input
                  type="file"
                  accept={slide.tipo === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) =>
                    onPickFile(slide.id, e.target.files?.[0] ?? null, slide.tipo)
                  }
                  className="mt-1 block w-full text-sm"
                />
              </label>

              {slide.url && slide.tipo === 'imagem' ? (
                <img
                  src={slide.url}
                  alt=""
                  className="mb-3 h-28 w-full rounded-xl object-cover"
                />
              ) : null}
              {slide.url && slide.tipo === 'video' ? (
                <video
                  src={slide.url}
                  className="mb-3 h-28 w-full rounded-xl object-cover"
                  muted
                  playsInline
                />
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  Linha pequena (eyebrow)
                  <input
                    value={slide.eyebrow}
                    onChange={(e) =>
                      updateSlide(slide.id, { eyebrow: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-brand-soft bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  Título
                  <input
                    value={slide.titulo}
                    onChange={(e) =>
                      updateSlide(slide.id, { titulo: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-brand-soft bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  Destaque (itálico)
                  <input
                    value={slide.tituloDestaque}
                    onChange={(e) =>
                      updateSlide(slide.id, { tituloDestaque: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-brand-soft bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  Frase / subtítulo
                  <textarea
                    value={slide.subtitulo}
                    onChange={(e) =>
                      updateSlide(slide.id, { subtitulo: e.target.value })
                    }
                    className="mt-1 min-h-16 w-full rounded-xl border border-brand-soft bg-white px-3 py-2"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <label className="block text-sm">
            Latitude loja
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) =>
                setForm({ ...form, lat: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Longitude loja
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) =>
                setForm({ ...form, lng: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
            />
          </label>
        </div>

        <p className="pt-2 text-sm font-medium">Frete</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Taxa base (R$)
            <input
              type="number"
              step="0.01"
              value={form.frete.taxaBase}
              onChange={(e) =>
                setForm({
                  ...form,
                  frete: { ...form.frete, taxaBase: Number(e.target.value) },
                })
              }
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Preço por km (R$)
            <input
              type="number"
              step="0.01"
              value={form.frete.precoPorKm}
              onChange={(e) =>
                setForm({
                  ...form,
                  frete: { ...form.frete, precoPorKm: Number(e.target.value) },
                })
              }
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Raio máximo (km)
            <input
              type="number"
              value={form.frete.raioMaxKm}
              onChange={(e) =>
                setForm({
                  ...form,
                  frete: { ...form.frete, raioMaxKm: Number(e.target.value) },
                })
              }
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Frete grátis acima de (R$)
            <input
              type="number"
              step="0.01"
              value={form.frete.freteGratisAcima}
              onChange={(e) =>
                setForm({
                  ...form,
                  frete: {
                    ...form.frete,
                    freteGratisAcima: Number(e.target.value),
                  },
                })
              }
              className="mt-1 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Salvar
        </button>
        {saved ? (
          <span className="ml-3 text-sm text-brand-deep">Salvo!</span>
        ) : null}
      </form>
    </div>
  )
}
