import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'

export function AdminLoginPage() {
  const { isAdmin, login, usingSupabase } = useStore()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (isAdmin) return <Navigate to="/admin" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const result = usingSupabase
        ? await login(email, senha)
        : await login(senha)
      if (result.ok) navigate('/admin')
      else setErro(result.message || 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#faf4f3] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-[1.75rem] bg-white p-7 shadow-sm ring-1 ring-brand-soft"
      >
        <img
          src="/logo.jpg"
          alt="EmilliStore"
          className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover ring-2 ring-brand-soft"
        />
        <h1 className="font-display text-center text-3xl text-ink">Admin</h1>
        <p className="mb-6 text-center text-sm text-muted">
          EmilliStore
          {usingSupabase ? ' · Supabase' : ' · local'}
        </p>

        {usingSupabase ? (
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-muted">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Senha</span>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
          />
        </label>
        {erro ? <p className="mt-2 text-sm text-rose-600">{erro}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <Link
          to="/"
          className="mt-4 block text-center text-sm text-muted underline"
        >
          Voltar à loja
        </Link>
      </form>
    </div>
  )
}
