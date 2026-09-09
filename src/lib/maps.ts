import type { LojaConfig } from '../types'

/** Link do Google Maps para a loja (coordenadas + texto do endereço). */
export function lojaMapsUrl(config: Pick<LojaConfig, 'lat' | 'lng' | 'enderecoLoja'>) {
  if (Number.isFinite(config.lat) && Number.isFinite(config.lng)) {
    return `https://www.google.com/maps?q=${config.lat},${config.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.enderecoLoja)}`
}
