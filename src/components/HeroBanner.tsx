import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    <section className="hero relative min-h-[72vh] overflow-hidden bg-[#2a2222] sm:mx-auto sm:min-h-[420px] sm:max-w-6xl sm:rounded-[2rem]">
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
                className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-[8s] ease-out"
              />
            )}
          </div>
        )
      })}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(50,32,31,.35) 0%, rgba(50,32,31,.55) 40%, rgba(50,32,31,.88) 100%)',
        }}
      />

      <div className="relative z-10 flex min-h-[72vh] flex-col justify-end px-5 pb-10 pt-24 sm:min-h-[420px] sm:justify-center sm:px-12 sm:pb-12 sm:pt-12 sm:text-center">
        <div className="max-w-[520px] sm:mx-auto">
          <p className="font-display text-3xl font-semibold tracking-wide text-[#f8f4f2] sm:text-4xl">
            EmilliStore
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-brand">
            {current.eyebrow}
          </p>
          <h1 className="mt-3 font-sans text-[clamp(28px,8vw,48px)] font-normal leading-[1.08] tracking-[-0.03em] text-[#f8f4f2]">
            {current.titulo}{' '}
            <em className="font-display italic font-semibold text-brand">
              {current.tituloDestaque}
            </em>
          </h1>
          <p className="mt-3 max-w-[340px] text-sm leading-relaxed text-[#e8dede] sm:mx-auto sm:text-base">
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
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50 sm:left-4 sm:flex"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50 sm:right-4 sm:flex"
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
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-7 bg-brand' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
