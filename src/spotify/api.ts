import { largestImageUrl } from './pixelate'

export type QueueTrack = {
  id: string
  name: string
  artists: string
}

export type TopArtist = {
  id: string
  name: string
  imageUrl: string | null
}

export type AudioAnalysis = {
  beats: { start: number; duration: number }[]
  segments: {
    start: number
    duration: number
    loudness_max: number
    pitches: number[]
  }[]
}

async function api<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (res.status === 204) return undefined as T
  if (!res.ok) throw new Error(`${path} ${res.status}`)
  return (await res.json()) as T
}

export async function transferPlayback(token: string, deviceId: string, play: boolean): Promise<void> {
  await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_ids: [deviceId], play }),
  })
}

export async function fetchQueue(token: string): Promise<QueueTrack[]> {
  const data = await api<{ queue?: { id: string; name: string; artists: { name: string }[] }[] }>(
    token,
    '/me/player/queue',
  )
  return (data.queue ?? []).slice(0, 6).map((t) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(', '),
  }))
}

export async function fetchTopArtists(token: string): Promise<TopArtist[]> {
  const data = await api<{
    items?: { id: string; name: string; images: { url: string; width?: number }[] }[]
  }>(token, '/me/top/artists?time_range=short_term&limit=3')
  return (data.items ?? []).slice(0, 3).map((a) => ({
    id: a.id,
    name: a.name,
    imageUrl: largestImageUrl(a.images),
  }))
}

export async function fetchAudioAnalysis(token: string, trackId: string): Promise<AudioAnalysis | null> {
  try {
    return await api<AudioAnalysis>(token, `/audio-analysis/${trackId}`)
  } catch {
    return null
  }
}
