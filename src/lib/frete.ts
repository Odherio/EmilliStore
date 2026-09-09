import type { FreteConfig } from '../types'
import { haversineKm } from './format'

export function calcularFrete(
  distanciaKm: number,
  subtotal: number,
  frete: FreteConfig,
) {
  if (distanciaKm > frete.raioMaxKm) {
    return {
      ok: false as const,
      message: `Fora da área de entrega (máx. ${frete.raioMaxKm} km).`,
    }
  }

  if (frete.freteGratisAcima > 0 && subtotal >= frete.freteGratisAcima) {
    return { ok: true as const, taxa: 0, distanciaKm }
  }

  const taxa = Math.max(
    0,
    Number((frete.taxaBase + distanciaKm * frete.precoPorKm).toFixed(2)),
  )

  return { ok: true as const, taxa, distanciaKm }
}

export function distanciaDaLoja(
  lojaLat: number,
  lojaLng: number,
  destLat: number,
  destLng: number,
) {
  return Number(haversineKm(lojaLat, lojaLng, destLat, destLng).toFixed(2))
}

/** Geocoding via Nominatim (OpenStreetMap) — sem chave. Troque por Google depois. */
export async function geocodeEndereco(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Falha ao buscar endereço')
  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  if (!data[0]) throw new Error('Endereço não encontrado')
  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não disponível neste aparelho'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
    })
  })
}
