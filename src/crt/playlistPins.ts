import type { PlaylistSummary } from '../spotify/api'

const PINS_KEY = 'vinyl-playlist-pins-v1'

export const PIN_COUNT = 5

export type Pin = PlaylistSummary | null

export type Pins = Pin[]

const EMPTY: Pins = Array.from({ length: PIN_COUNT }, () => null)

function isPin(value: unknown): value is PlaylistSummary {
  if (!value || typeof value !== 'object') return false
  const pin = value as Partial<PlaylistSummary>
  return (
    typeof pin.id === 'string' &&
    typeof pin.name === 'string' &&
    typeof pin.uri === 'string' &&
    pin.uri.startsWith('spotify:playlist:')
  )
}

export function loadPins(): Pins {
  const raw = localStorage.getItem(PINS_KEY)
  if (!raw) return EMPTY
  try {
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return EMPTY
    return Array.from({ length: PIN_COUNT }, (_, i) => (isPin(parsed[i]) ? parsed[i] : null))
  } catch {
    return EMPTY
  }
}

export function savePins(pins: Pins): void {
  localStorage.setItem(PINS_KEY, JSON.stringify(pins.slice(0, PIN_COUNT)))
}

export function setPin(pins: Pins, index: number, playlist: PlaylistSummary): Pins {
  const next = pins.slice()
  next[index] = playlist
  savePins(next)
  return next
}

export function clearPin(pins: Pins, index: number): Pins {
  const next = pins.slice()
  next[index] = null
  savePins(next)
  return next
}
