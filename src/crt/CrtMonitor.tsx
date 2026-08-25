import { useState, type CSSProperties } from 'react'
import { formatMs } from '../lib/time'
import type { QueueTrack } from '../spotify/api'
import type { NowPlaying } from '../spotify/useSpotifyPlayer'

type Props = {
  authed: boolean
  handlingCallback: boolean
  clientMissing: boolean
  error: string | null
  callbackError: string | null
  ready: boolean
  paused: boolean
  positionMs: number
  volume: number
  track: NowPlaying | null
  pixelArt: string | null
  queue: QueueTrack[]
  spectrum: number[]
  onConnect: () => void
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (ms: number) => void
  onVolume: (v: number) => void
}

export function CrtMonitor(props: Props) {
  const [tab, setTab] = useState<'now' | 'q'>('now')
  const duration = props.track?.durationMs ?? 0
  const progress = duration > 0 ? Math.min(1, props.positionMs / duration) : 0

  return (
    <div className="crt">
      <div className="crt__bezel">
        <div className="crt__screen">
          <div className="crt__phosphor" />
          <div className="crt__scanlines" />
          <div className="pixel-window">
            <div className="pixel-window__title">
              <span>SPOTIFY.EXE</span>
              <span className="pixel-window__dots">■■</span>
            </div>
            <div className="pixel-window__body">
              {props.clientMissing ? (
                <p className="crt-msg">SET VITE_SPOTIFY_CLIENT_ID</p>
              ) : props.handlingCallback ? (
                <p className="crt-msg">HANDSHAKING...</p>
              ) : !props.authed ? (
                <ConnectPane onConnect={props.onConnect} error={props.callbackError} />
              ) : props.error ? (
                <p className="crt-msg crt-msg--err">{props.error}</p>
              ) : !props.ready ? (
                <p className="crt-msg">WARMING TUBE...</p>
              ) : (
                <>
                  <div className="crt-tabs">
                    <button type="button" className={tab === 'now' ? 'is-on' : ''} onClick={() => setTab('now')}>
                      NOW
                    </button>
                    <button type="button" className={tab === 'q' ? 'is-on' : ''} onClick={() => setTab('q')}>
                      Q
                    </button>
                  </div>
                  {tab === 'now' ? (
                    <NowPlayingPane
                      track={props.track}
                      pixelArt={props.pixelArt}
                      positionMs={props.positionMs}
                      progress={progress}
                      onSeek={props.onSeek}
                    />
                  ) : (
                    <QueuePane queue={props.queue} />
                  )}
                  <Transport
                    paused={props.paused}
                    volume={props.volume}
                    onToggle={props.onToggle}
                    onPrev={props.onPrev}
                    onNext={props.onNext}
                    onVolume={props.onVolume}
                  />
                  <Spectrum bars={props.spectrum} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="crt__neck" />
      <div className="crt__base" />
    </div>
  )
}

function ConnectPane({ onConnect, error }: { onConnect: () => void; error: string | null }) {
  return (
    <div className="connect">
      <p className="crt-msg">INSERT ACCOUNT</p>
      {error ? <p className="crt-msg crt-msg--err">{error}</p> : null}
      <button type="button" className="px-btn px-btn--go" onClick={onConnect}>
        CONNECT
      </button>
    </div>
  )
}

function NowPlayingPane({
  track,
  pixelArt,
  positionMs,
  progress,
  onSeek,
}: {
  track: NowPlaying | null
  pixelArt: string | null
  positionMs: number
  progress: number
  onSeek: (ms: number) => void
}) {
  return (
    <div className="now">
      <div className="now__art">
        {pixelArt ? <img src={pixelArt} alt="" /> : <div className="now__art-empty" />}
      </div>
      <div className="now__meta">
        <p className="now__title">{track?.name ?? 'SILENCE'}</p>
        <p className="now__artist">{track?.artists ?? '—'}</p>
        <p className="now__time">
          {formatMs(positionMs)} / {formatMs(track?.durationMs ?? 0)}
        </p>
      </div>
      <button
        type="button"
        className="seek"
        aria-label="Seek"
        onClick={(e) => {
          if (!track) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          onSeek(x * track.durationMs)
        }}
      >
        <span className="seek__fill" style={{ width: `${progress * 100}%` }} />
      </button>
    </div>
  )
}

function QueuePane({ queue }: { queue: QueueTrack[] }) {
  if (queue.length === 0) return <p className="crt-msg">QUEUE EMPTY</p>
  return (
    <ul className="queue">
      {queue.map((t) => (
        <li key={t.id}>
          <span>{t.name}</span>
        </li>
      ))}
    </ul>
  )
}

function Transport({
  paused,
  volume,
  onToggle,
  onPrev,
  onNext,
  onVolume,
}: {
  paused: boolean
  volume: number
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onVolume: (v: number) => void
}) {
  const bars = 8
  const lit = Math.round(volume * bars)
  return (
    <div className="transport">
      <button type="button" className="px-btn" onClick={onPrev} aria-label="Previous">
        ◀◀
      </button>
      <button type="button" className="px-btn px-btn--go" onClick={onToggle} aria-label={paused ? 'Play' : 'Pause'}>
        {paused ? '▶' : '▐▐'}
      </button>
      <button type="button" className="px-btn" onClick={onNext} aria-label="Next">
        ▶▶
      </button>
      <div className="vol" role="group" aria-label="Volume">
        {Array.from({ length: bars }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`vol__bar ${i < lit ? 'is-lit' : ''}`}
            onClick={() => onVolume((i + 1) / bars)}
            aria-label={`Volume ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function Spectrum({ bars }: { bars: number[] }) {
  return (
    <div className="spectrum" aria-hidden>
      {bars.map((v, i) => (
        <span key={i} className="spectrum__col" style={{ '--h': v } as CSSProperties} />
      ))}
    </div>
  )
}
