import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { defaultBannerSlides } from '../data/seed'
import type { BannerSlide, LojaConfig } from '../types'

type Props = {
  config: LojaConfig
}

function resolveSlides(config: LojaConfig): BannerSlide[] {
  if (config.bannerSlides?.length) {
    return config.bannerSlides.filter((s) => s.url.trim())
  }
  if (config.capaUrl) {
    return [
      {
        id: 'legacy',
        tipo: 'imagem',
        url: config.capaUrl,
        eyebrow: config.heroEyebrow,
        titulo: config.heroTitulo,
        tituloDestaque: config.heroTituloDestaque,
        subtitulo: config.heroSubtitulo,
      },
    ]
  }
  return defaultBannerSlides
}

export function HeroBanner({ config }: Props) {
  const slides = useMemo(() => resolveSlides(config), [config])
  const [index, setIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalMs = config.bannerIntervalMs || 5000

  const current = slides[index] ?? slides[0]

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    if (current?.tipo === 'video') return

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [slides.length, intervalMs, current?.tipo, index])

  useEffect(() => {
    const video = videoRef.current
    if (!video || current?.tipo !== 'video') return

    void video.play().catch(() => undefined)

    const onEnded = () => {
      setIndex((i) => (i + 1) % slides.length)
    }
    video.addEventListener('ended', onEnded)
    return () => video.removeEventListener('ended', onEnded)
  }, [current?.id, current?.tipo, slides.length])

  if (!current) return null

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + slides.length) % slides.length)
  }

  return (
    <section className="hero relative mx-4 min-h-[320px] overflow-hidden rounded-3xl bg-[#2a2222] sm:mx-auto sm:max-w-6xl sm:min-h-[420px]">
      {slides.map((slide, i) => {
        const active = i === index
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!active}
          >
            {slide.tipo === 'video' ? (
              <video
                ref={active ? videoRef : undefined}
                src={slide.url}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                autoPlay={active}
                loop={slides.length === 1}
              />
            ) : (
              <img
                src={slide.url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        )
      })}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(42,24,28,.55) 0%, rgba(42,24,28,.72) 45%, rgba(42,24,28,.82) 100%)',
        }}
      />

      <div className="relative z-10 flex min-h-[320px] items-center justify-center px-6 py-10 text-center sm:min-h-[420px] sm:px-12">
        <div className="max-w-[640px]">
          <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-brand">
            <Sparkles size={14} />
            {current.eyebrow}
          </span>
          <h1 className="mt-4 font-sans text-[clamp(34px,6vw,64px)] font-normal leading-[1.06] tracking-[-0.045em] text-[#f8f4f2]">
            {current.titulo}
            <br />
            <em className="font-display italic font-semibold text-brand">
              {current.tituloDestaque}
            </em>
          </h1>
          <p className="mx-auto mt-4 max-w-[380px] text-sm leading-relaxed text-[#e8dede] sm:text-base">
            {current.subtitulo}
          </p>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50 sm:left-4"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50 sm:right-4"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-brand' : 'w-2 bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
