import { CrtMonitor } from '../crt/CrtMonitor'
import { SpeakerPair } from '../speakers/SpeakerPair'
import type { PlaylistSummary, QueueTrack } from '../spotify/api'
import type { NowPlaying, PosterArtist } from '../spotify/useSpotifyPlayer'
import { Turntable } from '../turntable/Turntable'
import { ArtistPosters } from './ArtistPosters'
import { DeskLamp } from './DeskLamp'
import { DustMotes } from './DustMotes'
import { LeaningRecords } from './LeaningRecords'
import { LightBeams } from './LightBeams'
import { Mug } from './Mug'
import { Plant } from './Plant'
import { VinylCrate } from './VinylCrate'

type Props = {
  scale: number
  fullscreen: boolean
  onFullscreen: () => void
  postersVisible: boolean
  onTogglePosters: () => void
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
  onLoadPlaylists: () => Promise<PlaylistSummary[]>
  onPlayPlaylist: (uri: string) => Promise<void>
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
          <div className="window__clouds" />
          <div className="window__skyline" />
          <div className="window__lit window__lit--a" />
          <div className="window__lit window__lit--b" />
          <div className="window__lit window__lit--c" />
          <div className="window__blinds" />
          <div className="window__sill" />
        </div>
        {props.postersVisible ? <ArtistPosters artists={props.topArtists} /> : null}
        <LeaningRecords />
        <LightBeams />
        <DustMotes quiet={quiet} />
        <div className="desk" />
        <VinylCrate />
        <DeskLamp />
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
          onLoadPlaylists={props.onLoadPlaylists}
          onPlayPlaylist={props.onPlayPlaylist}
        />
        <Mug />
        <Turntable paused={props.paused} hasTrack={Boolean(props.track)} pixelArt={props.pixelArt} />
        <div className="hud-btns">
          <button
            type="button"
            className="fs-btn"
            onClick={props.onTogglePosters}
            aria-label={props.postersVisible ? 'Hide posters' : 'Show posters'}
          >
            {props.postersVisible ? 'PS' : 'OFF'}
          </button>
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
    </div>
  )
}
