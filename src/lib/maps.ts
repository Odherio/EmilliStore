import type { Endereco, LojaConfig } from '../types'

/** Link do Google Maps para a loja (coordenadas + texto do endereço). */
export function lojaMapsUrl(config: Pick<LojaConfig, 'lat' | 'lng' | 'enderecoLoja'>) {
  if (Number.isFinite(config.lat) && Number.isFinite(config.lng)) {
    return `https://www.google.com/maps?q=${config.lat},${config.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.enderecoLoja)}`
}

/** Link do Google Maps para o endereço de entrega do cliente. */
export function enderecoMapsUrl(endereco: Endereco) {
  if (
    endereco.lat != null &&
    endereco.lng != null &&
    Number.isFinite(endereco.lat) &&
    Number.isFinite(endereco.lng)
  ) {
    return `https://www.google.com/maps?q=${endereco.lat},${endereco.lng}`
  }
  const query = [
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
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
