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

export type PlaylistSummary = {
  id: string
  name: string
  uri: string
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

type PlaylistPage = {
  items?: ({ id: string; name: string; uri: string } | null)[]
  next: string | null
}

export async function fetchUserPlaylists(token: string): Promise<PlaylistSummary[]> {
  const out: PlaylistSummary[] = []
  let path: string | null = '/me/playlists?limit=50'
  // Spotify caps page size at 50; walk `next` until the library is exhausted.
  while (path) {
    const page: PlaylistPage = await api<PlaylistPage>(token, path)
    for (const item of page.items ?? []) {
      if (item?.uri) out.push({ id: item.id, name: item.name, uri: item.uri })
    }
    path = page.next ? page.next.replace('https://api.spotify.com/v1', '') : null
  }
  return out
}

export async function playContext(token: string, deviceId: string, contextUri: string): Promise<void> {
  await api(token, `/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: 'PUT',
    body: JSON.stringify({ context_uri: contextUri }),
  })
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
