import { Tonearm } from './Tonearm'
import { VinylDisc } from './VinylDisc'

type Props = {
  paused: boolean
  hasTrack: boolean
  pixelArt: string | null
}

export function Turntable({ paused, hasTrack, pixelArt }: Props) {
  const spinning = hasTrack && !paused
  const coasting = hasTrack && paused
  return (
    <div className="turntable">
      <div className="turntable__cabinet">
        <div className="turntable__plinth" />
      </div>
      <div className="turntable__plate">
        <div className="turntable__mat" />
        <div className="turntable__ring" />
        <VinylDisc spinning={spinning} coasting={coasting} pixelArt={pixelArt} />
        <div className="turntable__controls">
          <div className="turntable__switch" />
          <div className="turntable__knob" />
          <div className="turntable__badge" />
        </div>
        <Tonearm playing={spinning} />
        <div className="turntable__cue" />
      </div>
    </div>
  )
}
