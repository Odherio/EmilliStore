import { ArrowLeft, MapPin, Minus, Plus, Store, Trash2, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useStore } from '../context/StoreContext'
import {
  calcularFrete,
  distanciaDaLoja,
  geocodeEndereco,
  getCurrentPosition,
} from '../lib/frete'
import { formatBRL, formatWhatsappMask } from '../lib/format'
import { buildWhatsappMessage, openWhatsapp } from '../lib/whatsapp'
import type { Endereco, TipoEntrega } from '../types'
import { Sheet } from './Sheet'

type Step = 'cart' | 'entrega' | 'dados' | 'sucesso'

type Props = {
  open: boolean
  onClose: () => void
}

const emptyEndereco: Endereco = {
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  uf: '',
  referencia: '',
}

export function CheckoutSheet({ open, onClose }: Props) {
  const {
    carrinho,
    updateQty,
    removeFromCart,
    cartTotal,
    config,
    criarPedido,
    clearCart,
  } = useStore()

  const [step, setStep] = useState<Step>('cart')
  const [tipo, setTipo] = useState<TipoEntrega>('retirada')
  const [endereco, setEndereco] = useState<Endereco>(emptyEndereco)
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null)
  const [taxaEntrega, setTaxaEntrega] = useState(0)
  const [freteErro, setFreteErro] = useState('')
  const [calculando, setCalculando] = useState(false)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [obs, setObs] = useState('')
  const [pedidoCodigo, setPedidoCodigo] = useState('')

  const total = cartTotal + (tipo === 'entrega' ? taxaEntrega : 0)

  const titles = useMemo(
    () =>
      ({
        cart: { title: 'Seu pedido', subtitle: undefined as string | undefined },
        entrega: {
          title: 'Como você quer receber',
          subtitle: undefined,
        },
        dados: {
          title: 'Seus dados',
          subtitle: 'Só falta isso para enviar',
        },
        sucesso: {
          title: 'Pedido enviado',
          subtitle: 'A loja confirma pelo WhatsApp',
        },
      })[step],
    [step],
  )

  const resetClose = () => {
    setStep('cart')
    onClose()
  }

  const atualizarFrete = async (lat: number, lng: number) => {
    const dist = distanciaDaLoja(config.lat, config.lng, lat, lng)
    setDistanciaKm(dist)
    const result = calcularFrete(dist, cartTotal, config.frete)
    if (!result.ok) {
      setFreteErro(result.message)
      setTaxaEntrega(0)
      return false
    }
    setFreteErro('')
    setTaxaEntrega(result.taxa)
    return true
  }

  const usarLocalizacao = async () => {
    setCalculando(true)
    setFreteErro('')
    try {
      const pos = await getCurrentPosition()
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setEndereco((e) => ({ ...e, lat, lng }))
      await atualizarFrete(lat, lng)
    } catch {
      setFreteErro('Não foi possível obter sua localização.')
    } finally {
      setCalculando(false)
    }
  }

  const calcularPorEndereco = async () => {
    if (!endereco.rua.trim() || !endereco.cidade.trim()) {
      setFreteErro('Preencha rua e cidade para calcular a taxa.')
      return false
    }
    setCalculando(true)
    setFreteErro('')
    try {
      const q = [
        endereco.rua,
        endereco.numero,
        endereco.bairro,
        endereco.cidade,
        endereco.uf,
        endereco.cep,
        'Brasil',
      ]
        .filter(Boolean)
        .join(', ')
      const { lat, lng } = await geocodeEndereco(q)
      setEndereco((e) => ({ ...e, lat, lng }))
      return await atualizarFrete(lat, lng)
    } catch {
      setFreteErro('Não encontramos esse endereço. Tente de novo.')
      return false
    } finally {
      setCalculando(false)
    }
  }

  const enviarPedido = async () => {
    if (!nome.trim() || whatsapp.replace(/\D/g, '').length < 10) return

    try {
      const pedido = await criarPedido({
        clienteNome: nome.trim(),
        clienteWhatsapp: whatsapp,
        clienteEmail: email.trim(),
        observacoes: obs.trim(),
        tipoEntrega: tipo,
        endereco: tipo === 'entrega' ? endereco : undefined,
        distanciaKm: tipo === 'entrega' ? distanciaKm ?? undefined : undefined,
        taxaEntrega: tipo === 'entrega' ? taxaEntrega : 0,
        subtotal: cartTotal,
        total,
        itens: carrinho,
      })

      const msg = buildWhatsappMessage(pedido, config.nome)
      openWhatsapp(config.whatsapp, msg)
      clearCart()
      setPedidoCodigo(pedido.codigo)
      setStep('sucesso')
    } catch (err) {
      console.error(err)
      alert('Não foi possível enviar o pedido. Tente de novo.')
    }
  }

  const footer =
    step === 'cart' ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={resetClose}
          className="rounded-full border border-brand-soft px-4 py-3 text-sm"
        >
          Continuar comprando
        </button>
        <button
          type="button"
          disabled={!carrinho.length}
          onClick={() => setStep('entrega')}
          className="flex-1 rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
        >
          Continuar · {formatBRL(cartTotal)}
        </button>
      </div>
    ) : step === 'entrega' ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep('cart')}
          className="rounded-full border border-brand-soft p-3"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          disabled={
            tipo === 'entrega' &&
            (!!freteErro || (!distanciaKm && !endereco.lat))
          }
          onClick={async () => {
            if (tipo === 'retirada') {
              setTaxaEntrega(0)
              setStep('dados')
              return
            }
            if (endereco.lat && endereco.lng && !freteErro) {
              setStep('dados')
              return
            }
            const ok = await calcularPorEndereco()
            if (ok) setStep('dados')
          }}
          className="flex-1 rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
        >
          {tipo === 'entrega' && !distanciaKm
            ? calculando
              ? 'Calculando…'
              : 'Informe o endereço'
            : `Continuar · ${formatBRL(total)}`}
        </button>
      </div>
    ) : step === 'dados' ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep('entrega')}
          className="rounded-full border border-brand-soft p-3"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          disabled={!nome.trim() || whatsapp.replace(/\D/g, '').length < 10}
          onClick={enviarPedido}
          className="flex-1 rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
        >
          Enviar pedido
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={resetClose}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        Voltar à loja
      </button>
    )

  return (
    <Sheet
      open={open}
      onClose={resetClose}
      title={titles.title}
      subtitle={titles.subtitle}
      footer={footer}
    >
      {step === 'cart' && (
        <div className="space-y-4">
          {!carrinho.length ? (
            <p className="py-8 text-center text-muted">Seu carrinho está vazio.</p>
          ) : (
            <ul className="space-y-3">
              {carrinho.map((item) => (
                <li
                  key={`${item.produto_id}-${item.variacao_id}`}
                  className="flex gap-3 rounded-2xl bg-cream p-3"
                >
                  <img
                    src={item.imagem}
                    alt=""
                    className="h-20 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{item.nome}</p>
                    <p className="text-sm text-muted">{item.variacao}</p>
                    <p className="text-xs text-muted">
                      {formatBRL(item.preco)} cada
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuir"
                        onClick={() =>
                          updateQty(
                            item.produto_id,
                            item.variacao_id,
                            item.quantidade - 1,
                          )
                        }
                        className="rounded-full bg-white p-1 ring-1 ring-brand-soft"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm">
                        {item.quantidade}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar"
                        onClick={() =>
                          updateQty(
                            item.produto_id,
                            item.variacao_id,
                            item.quantidade + 1,
                          )
                        }
                        className="rounded-full bg-white p-1 ring-1 ring-brand-soft"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remover item"
                        onClick={() =>
                          removeFromCart(item.produto_id, item.variacao_id)
                        }
                        className="ml-auto text-muted hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-brand-deep">
                    {formatBRL(item.preco * item.quantidade)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {carrinho.length > 0 ? (
            <div className="flex justify-between border-t border-brand-soft pt-3 text-sm">
              <span>Total</span>
              <strong>{formatBRL(cartTotal)}</strong>
            </div>
          ) : null}
        </div>
      )}

      {step === 'entrega' && (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setTipo('retirada')
                setFreteErro('')
                setTaxaEntrega(0)
              }}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                tipo === 'retirada'
                  ? 'border-brand bg-brand-soft/60'
                  : 'border-brand-soft bg-white'
              }`}
            >
              <Store className="mt-0.5 text-brand-deep" size={20} />
              <span>
                <span className="block font-medium">Retirar no local</span>
                <span className="text-sm text-muted">Sem taxa</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTipo('entrega')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                tipo === 'entrega'
                  ? 'border-brand bg-brand-soft/60'
                  : 'border-brand-soft bg-white'
              }`}
            >
              <Truck className="mt-0.5 text-brand-deep" size={20} />
              <span>
                <span className="block font-medium">Entrega</span>
                <span className="text-sm text-muted">Calculamos pela distância</span>
              </span>
            </button>
          </div>

          {tipo === 'entrega' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={usarLocalizacao}
                disabled={calculando}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-brand bg-white py-2.5 text-sm font-medium text-brand-deep hover:bg-brand-soft"
              >
                <MapPin size={16} />
                Usar minha localização
              </button>

              {(
                [
                  ['rua', 'Rua *', 'Nome da rua'],
                  ['numero', 'Número', '123'],
                  ['complemento', 'Complemento', 'Apto, bloco…'],
                  ['bairro', 'Bairro', ''],
                  ['cep', 'CEP', '00000-000'],
                  ['cidade', 'Cidade *', ''],
                ] as const
              ).map(([key, label, ph]) => (
                <label key={key} className="block text-sm">
                  <span className="mb-1 block text-muted">{label}</span>
                  <input
                    value={endereco[key]}
                    placeholder={ph}
                    onChange={(e) =>
                      setEndereco((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
                  />
                </label>
              ))}

              <label className="block text-sm">
                <span className="mb-1 block text-muted">UF</span>
                <select
                  value={endereco.uf}
                  onChange={(e) =>
                    setEndereco((prev) => ({ ...prev, uf: e.target.value }))
                  }
                  className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
                >
                  <option value="">—</option>
                  {'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'
                    .split(' ')
                    .map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-muted">Ponto de referência</span>
                <textarea
                  value={endereco.referencia}
                  placeholder="Ex.: portão bege, ao lado da padaria"
                  onChange={(e) =>
                    setEndereco((prev) => ({
                      ...prev,
                      referencia: e.target.value,
                    }))
                  }
                  className="min-h-20 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
                />
              </label>

              <div className="rounded-xl bg-brand-soft/70 px-3 py-2 text-sm text-ink">
                Preencha rua e cidade (ou use localização) para calcularmos a taxa.
                {distanciaKm != null && !freteErro ? (
                  <p className="mt-1 font-medium">
                    {distanciaKm} km · taxa {formatBRL(taxaEntrega)}
                  </p>
                ) : null}
              </div>
              {freteErro ? (
                <p className="text-sm text-rose-600">{freteErro}</p>
              ) : null}
            </div>
          )}
        </div>
      )}

      {step === 'dados' && (
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Seu nome *</span>
            <input
              value={nome}
              placeholder="Nome e sobrenome"
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">WhatsApp *</span>
            <input
              value={whatsapp}
              placeholder="(11) 90000-0000"
              onChange={(e) => setWhatsapp(formatWhatsappMask(e.target.value))}
              className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
            />
            <span className="mt-1 block text-xs text-muted">
              É por aqui que vamos confirmar seu pedido
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">E-mail</span>
            <input
              value={email}
              placeholder="Opcional"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Observações</span>
            <textarea
              value={obs}
              placeholder="Forma de pagamento, horário…"
              onChange={(e) => setObs(e.target.value)}
              className="min-h-24 w-full rounded-xl border border-brand-soft bg-cream px-3 py-2.5 outline-none focus:border-brand"
            />
          </label>
          <div className="rounded-xl bg-cream p-3 text-sm">
            <div className="flex justify-between">
              <span>
                {carrinho.reduce((s, i) => s + i.quantidade, 0)}{' '}
                {carrinho.length === 1 ? 'item' : 'itens'}
              </span>
              <span>{formatBRL(cartTotal)}</span>
            </div>
            {tipo === 'entrega' ? (
              <div className="mt-1 flex justify-between text-muted">
                <span>Entrega</span>
                <span>{formatBRL(taxaEntrega)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-brand-soft pt-2 font-semibold">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Ao enviar, seu pedido fica reservado para conferência. A loja confirma
            pelo WhatsApp antes de fechar.
          </p>
        </div>
      )}

      {step === 'sucesso' && (
        <div className="space-y-3 py-6 text-center">
          <p className="font-display text-3xl text-brand-deep">Obrigada!</p>
          <p className="text-muted">
            Pedido <strong className="text-ink">{pedidoCodigo}</strong> enviado.
            Em breve confirmamos no WhatsApp.
          </p>
        </div>
      )}
    </Sheet>
  )
}
