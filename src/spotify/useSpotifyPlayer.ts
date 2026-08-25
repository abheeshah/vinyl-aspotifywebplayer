import { useCallback, useEffect, useRef, useState } from 'react'
import { validAccessToken } from '../auth/tokenStore'
import {
  fetchAudioAnalysis,
  fetchQueue,
  fetchTopArtists,
  transferPlayback,
  type AudioAnalysis,
  type QueueTrack,
} from './api'
import { largestImageUrl, pixelateImage } from './pixelate'
import { loadSpotifySdk } from './sdk'

export type PosterArtist = {
  id: string
  name: string
  pixelArt: string | null
}

const VOLUME_KEY = 'vinyl-volume'

export type NowPlaying = {
  id: string
  name: string
  artists: string
  durationMs: number
  artUrl: string | null
}

export type PlayerModel = {
  ready: boolean
  error: string | null
  paused: boolean
  positionMs: number
  volume: number
  track: NowPlaying | null
  pixelArt: string | null
  queue: QueueTrack[]
  topArtists: PosterArtist[]
  pulse: boolean
  spectrum: number[]
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (ms: number) => void
  setVolume: (v: number) => void
}

const EMPTY_SPEC = Array.from({ length: 16 }, () => 0.08)

function spectrumAt(analysis: AudioAnalysis | null, posMs: number, paused: boolean): number[] {
  if (paused) return EMPTY_SPEC
  const t = posMs / 1000
  if (!analysis?.segments.length) {
    return Array.from({ length: 16 }, (_, i) => 0.18 + 0.72 * Math.abs(Math.sin(t * 6.2 + i * 0.45)))
  }
  let seg = analysis.segments[0]
  for (const s of analysis.segments) {
    if (s.start <= t) seg = s
    else break
  }
  if (!seg) return EMPTY_SPEC
  const boost = Math.min(1.2, Math.max(0.25, (seg.loudness_max + 55) / 40))
  const pitches = seg.pitches.length ? seg.pitches : Array.from({ length: 16 }, () => 0.4)
  return Array.from({ length: 16 }, (_, i) => Math.min(1, (pitches[i % pitches.length] ?? 0.3) * boost))
}

function nearBeat(analysis: AudioAnalysis | null, posMs: number, paused: boolean): boolean {
  if (paused || !analysis?.beats.length) {
    if (paused) return false
    return Math.sin(posMs / 140) > 0.72
  }
  const t = posMs / 1000
  return analysis.beats.some((b) => Math.abs(b.start - t) < 0.09)
}

export function useSpotifyPlayer(clientId: string | undefined, authed: boolean): PlayerModel {
  const playerRef = useRef<Spotify.Player | null>(null)
  const tokenRef = useRef<string | null>(null)
  const posBase = useRef({ ms: 0, at: 0, paused: true })
  const analysisRef = useRef<AudioAnalysis | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paused, setPaused] = useState(true)
  const [positionMs, setPositionMs] = useState(0)
  const [volume, setVolumeState] = useState(() => {
    const stored = Number(localStorage.getItem(VOLUME_KEY))
    return Number.isFinite(stored) && stored >= 0 ? stored : 0.7
  })
  const [track, setTrack] = useState<NowPlaying | null>(null)
  const [pixelArt, setPixelArt] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueueTrack[]>([])
  const [topArtists, setTopArtists] = useState<PosterArtist[]>([])
  const [pulse, setPulse] = useState(false)
  const [spectrum, setSpectrum] = useState<number[]>(EMPTY_SPEC)

  const getToken = useCallback(async () => {
    if (!clientId) return null
    const token = await validAccessToken(clientId)
    tokenRef.current = token
    return token
  }, [clientId])

  useEffect(() => {
    if (!authed || !clientId) return
    let cancelled = false

    const boot = async () => {
      try {
        await loadSpotifySdk()
        const token = await getToken()
        if (!token || cancelled) return

        const storedVol = Number(localStorage.getItem(VOLUME_KEY))
        const startVol = Number.isFinite(storedVol) ? storedVol : 0.7

        const player = new window.Spotify.Player({
          name: 'Vinyl Player',
          volume: startVol,
          getOAuthToken: (cb) => {
            void getToken().then((t) => {
              if (t) cb(t)
            })
          },
        })
        playerRef.current = player

        player.addListener('account_error', () => {
          setError('PREMIUM REQUIRED')
        })
        player.addListener('authentication_error', () => {
          setError('AUTH FAILED')
        })
        player.addListener('initialization_error', () => {
          setError('INIT FAILED')
        })
        player.addListener('playback_error', (e) => {
          setError(e.message)
        })

        player.addListener('ready', ({ device_id }) => {
          setReady(true)
          setError(null)
          void getToken().then((t) => {
            if (t) void transferPlayback(t, device_id, true)
          })
        })

        player.addListener('not_ready', () => setReady(false))

        player.addListener('player_state_changed', (state) => {
          if (!state) return
          const current = state.track_window.current_track
          const id = current.id ?? current.uri
          posBase.current = { ms: state.position, at: Date.now(), paused: state.paused }
          setPaused(state.paused)
          setPositionMs(state.position)
          setTrack({
            id,
            name: current.name,
            artists: current.artists.map((a) => a.name).join(', '),
            durationMs: current.duration_ms,
            artUrl: largestImageUrl(current.album.images),
          })
        })

        const ok = await player.connect()
        if (!ok && !cancelled) setError('CONNECT FAILED')
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'PLAYER ERROR')
      }
    }

    void boot()
    return () => {
      cancelled = true
      playerRef.current?.disconnect()
      playerRef.current = null
    }
  }, [authed, clientId, getToken])

  useEffect(() => {
    if (!track?.artUrl) {
      setPixelArt(null)
      return
    }
    let live = true
    void pixelateImage(track.artUrl, 24)
      .then((data) => {
        if (live) setPixelArt(data)
      })
      .catch(() => {
        if (live) setPixelArt(track.artUrl)
      })
    return () => {
      live = false
    }
  }, [track?.artUrl])

  useEffect(() => {
    if (!track?.id || !tokenRef.current) {
      analysisRef.current = null
      return
    }
    const token = tokenRef.current
    const id = track.id.includes(':') ? track.id.split(':').pop()! : track.id
    let live = true
    void fetchAudioAnalysis(token, id).then((data) => {
      if (!live) return
      analysisRef.current = data
    })
    void fetchQueue(token)
      .then((q) => {
        if (live) setQueue(q)
      })
      .catch(() => {
        if (live) setQueue([])
      })
    return () => {
      live = false
    }
  }, [track?.id])

  useEffect(() => {
    if (!authed || !clientId) {
      setTopArtists([])
      return
    }
    let live = true
    void getToken()
      .then(async (token) => {
        if (!token || !live) return
        const artists = await fetchTopArtists(token)
        const posters = await Promise.all(
          artists.map(async (a) => {
            let pixelArt: string | null = null
            if (a.imageUrl) {
              try {
                pixelArt = await pixelateImage(a.imageUrl, 48)
              } catch {
                pixelArt = a.imageUrl
              }
            }
            return { id: a.id, name: a.name, pixelArt }
          }),
        )
        if (live) setTopArtists(posters)
      })
      .catch(() => {
        if (live) setTopArtists([])
      })
    return () => {
      live = false
    }
  }, [authed, clientId, getToken])

  useEffect(() => {
    const tick = () => {
      const base = posBase.current
      const pos = base.paused ? base.ms : base.ms + (Date.now() - base.at)
      setPositionMs(pos)
      setSpectrum(spectrumAt(analysisRef.current, pos, base.paused))
      setPulse(nearBeat(analysisRef.current, pos, base.paused))
    }
    const id = window.setInterval(tick, 80)
    return () => window.clearInterval(id)
  }, [])

  const togglePlay = useCallback(() => {
    void playerRef.current?.togglePlay()
  }, [])
  const next = useCallback(() => {
    void playerRef.current?.nextTrack()
  }, [])
  const previous = useCallback(() => {
    void playerRef.current?.previousTrack()
  }, [])
  const seek = useCallback((ms: number) => {
    void playerRef.current?.seek(ms)
  }, [])
  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    setVolumeState(clamped)
    localStorage.setItem(VOLUME_KEY, String(clamped))
    void playerRef.current?.setVolume(clamped)
  }, [])

  return {
    ready,
    error,
    paused,
    positionMs,
    volume,
    track,
    pixelArt,
    queue,
    topArtists,
    pulse,
    spectrum,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
  }
}
