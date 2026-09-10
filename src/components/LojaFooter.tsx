import {
  ChevronRight,
  Clock,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LojaConfig } from '../types'

const INSTAGRAM_URL =
  'https://www.instagram.com/emillistore_?stkn=ZWp6NWE0bmwwdWxu'

type Props = {
  config: LojaConfig
  categorias: string[]
  waUrl: string
  onInicio: () => void
  onCatalogo: () => void
  onCategoria: (nome: string) => void
  onNovidades: () => void
  onPromocoes: () => void
}

function formatWhatsappDisplay(digits: string) {
  const d = digits.replace(/\D/g, '')
  const local = d.startsWith('55') ? d.slice(2) : d
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  }
  return local || '—'
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3Z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.18 8.18 0 0 0 4.76 1.52V6.8a4.85 4.85 0 0 1-1-.11Z" />
    </svg>
  )
}

export function LojaFooter({
  config,
  categorias,
  waUrl,
  onInicio,
  onCatalogo,
  onCategoria,
  onNovidades,
  onPromocoes,
}: Props) {
  const phone = formatWhatsappDisplay(config.whatsapp)
  const cats = categorias.filter((c) => c !== 'Tudo').slice(0, 5)
  const fallbackCats = ['Roupas', 'Conjuntos', 'Blusas', 'Calças', 'Acessórios']
  const listaCats = cats.length ? cats : fallbackCats
  const year = new Date().getFullYear()

  const linkClass =
    'inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-brand-deep'

  return (
    <footer className="mt-10 border-t border-brand-soft/70 bg-blush/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div>
              <p className="font-display text-2xl leading-none text-brand-deep">
                {config.nome}
              </p>
              <p className="mt-1 text-xs text-brand-deep/80">
                Moda feminina · Goiânia
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Looks modernos, elegantes e cheios de personalidade para você se
            sentir ainda mais linda!
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-deep text-white transition hover:bg-brand"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-deep text-white transition hover:bg-brand"
            >
              <MessageCircle size={16} />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-deep text-white transition hover:bg-brand"
              title="Em breve"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-deep text-white transition hover:bg-brand"
              title="Em breve"
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Links rápidos — compacto no mobile */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-brand-deep">
            Links Rápidos
          </h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            <li>
              <button type="button" onClick={onInicio} className={linkClass}>
                <ChevronRight size={14} className="text-muted/70" />
                Início
              </button>
            </li>
            <li>
              <button type="button" onClick={onCatalogo} className={linkClass}>
                <ChevronRight size={14} className="text-muted/70" />
                Categorias
              </button>
            </li>
            <li>
              <button type="button" onClick={onNovidades} className={linkClass}>
                <ChevronRight size={14} className="text-muted/70" />
                Novidades
              </button>
            </li>
            <li>
              <button type="button" onClick={onPromocoes} className={linkClass}>
                <ChevronRight size={14} className="text-muted/70" />
                Promoções
              </button>
            </li>
            <li>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <ChevronRight size={14} className="text-muted/70" />
                Contato
              </a>
            </li>
          </ul>
        </div>

        {/* Categorias */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-brand-deep">
            Categorias
          </h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {listaCats.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => onCategoria(c)}
                  className={linkClass}
                >
                  <ChevronRight size={14} className="text-muted/70" />
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-brand-deep">
            Fale Conosco
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-deep text-white">
                <MessageCircle size={13} />
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pt-1 hover:text-brand-deep"
              >
                {phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-deep text-white">
                <Mail size={13} />
              </span>
              <a
                href="mailto:contato@emillistore.com.br"
                className="break-all pt-1 hover:text-brand-deep"
              >
                contato@emillistore.com.br
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-deep text-white">
                <MapPin size={13} />
              </span>
              <span className="pt-1">Goiânia - GO</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-deep text-white">
                <Clock size={13} />
              </span>
              <span className="pt-1">Seg a Sex: 08h às 18h</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-soft/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {config.nome}. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1">
              <Lock size={12} />
              Compra segura
            </span>
            <span className="hidden text-brand-soft sm:inline">|</span>
            <span className="font-semibold tracking-wide text-ink/70">VISA</span>
            <span className="font-semibold tracking-wide text-ink/70">
              Mastercard
            </span>
            <span className="rounded bg-brand-soft px-1.5 py-0.5 font-semibold text-brand-deep">
              Pix
            </span>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pb-5 text-xs text-muted">
          <Link to="/admin" className="underline hover:text-brand-deep">
            Área admin
          </Link>
          <p>
            Desenvolvido por{' '}
            <a
              href="https://wa.me/5562991389317"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-deep underline underline-offset-2"
            >
              Odherio
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
