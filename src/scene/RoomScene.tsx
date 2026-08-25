import { CrtMonitor } from '../crt/CrtMonitor'
import { SpeakerPair } from '../speakers/SpeakerPair'
import type { QueueTrack } from '../spotify/api'
import type { NowPlaying, PosterArtist } from '../spotify/useSpotifyPlayer'
import { Turntable } from '../turntable/Turntable'
import { ArtistPosters } from './ArtistPosters'
import { DustMotes } from './DustMotes'
import { LightBeams } from './LightBeams'
import { Mug } from './Mug'
import { Plant } from './Plant'

type Props = {
  scale: number
  fullscreen: boolean
  onFullscreen: () => void
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
  topArtists: PosterArtist[]
  spectrum: number[]
  pulse: boolean
  onConnect: () => void
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (ms: number) => void
  onVolume: (v: number) => void
}

export function RoomScene(props: Props) {
  const quiet = props.paused || !props.track
  return (
    <div className="letterbox">
      <div
        className="stage"
        style={{ transform: `scale(${props.scale})` }}
      >
        <div className="wall" />
        <div className="brick" />
        <div className="window">
          <div className="window__sky" />
          <div className="window__blinds" />
        </div>
        <ArtistPosters artists={props.topArtists} />
        <LightBeams />
        <DustMotes quiet={quiet} />
        <div className="desk" />
        <Plant />
        <SpeakerPair pulse={props.pulse} />
        <CrtMonitor
          authed={props.authed}
          handlingCallback={props.handlingCallback}
          clientMissing={props.clientMissing}
          error={props.error}
          callbackError={props.callbackError}
          ready={props.ready}
          paused={props.paused}
          positionMs={props.positionMs}
          volume={props.volume}
          track={props.track}
          pixelArt={props.pixelArt}
          queue={props.queue}
          spectrum={props.spectrum}
          onConnect={props.onConnect}
          onToggle={props.onToggle}
          onPrev={props.onPrev}
          onNext={props.onNext}
          onSeek={props.onSeek}
          onVolume={props.onVolume}
        />
        <Mug />
        <Turntable paused={props.paused} hasTrack={Boolean(props.track)} pixelArt={props.pixelArt} />
        <button
          type="button"
          className="fs-btn"
          onClick={props.onFullscreen}
          aria-label={props.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {props.fullscreen ? 'ESC' : 'FS'}
        </button>
      </div>
    </div>
  )
}
