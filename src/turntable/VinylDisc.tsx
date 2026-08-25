type Props = {
  spinning: boolean
  coasting: boolean
  pixelArt: string | null
}

export function VinylDisc({ spinning, coasting, pixelArt }: Props) {
  const spinClass = spinning ? 'is-spinning' : coasting ? 'is-coasting' : 'is-stopped'
  return (
    <div className={`vinyl ${spinClass}`} aria-hidden>
      <div className="vinyl__grooves" />
      <div className="vinyl__sheen" />
      <div className="vinyl__label">
        {pixelArt ? (
          <img src={pixelArt} alt="" className="vinyl__art" />
        ) : (
          <div className="vinyl__blank">
            <span>VINYL</span>
          </div>
        )}
        <div className="vinyl__spindle" />
      </div>
    </div>
  )
}
