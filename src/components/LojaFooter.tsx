import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LojaConfig } from '../types'

type Props = {
  config: LojaConfig
}

export function LojaFooter({ config }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-brand-soft/70 bg-blush/30">
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
    </footer>
  )
}
