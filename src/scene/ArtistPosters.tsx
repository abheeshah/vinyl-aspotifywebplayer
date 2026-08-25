import type { PosterArtist } from '../spotify/useSpotifyPlayer'

type Props = {
  artists: PosterArtist[]
}

const SLOTS = [0, 1, 2] as const

export function ArtistPosters({ artists }: Props) {
  const label =
    artists.length > 0
      ? `Top artists this month: ${artists.map((a) => a.name).join(', ')}`
      : 'Top artists wall'

  return (
    <div className="posters" aria-label={label}>
      {SLOTS.map((i) => {
        const artist = artists[i]
        return (
          <div
            key={artist?.id ?? `empty-${i}`}
            className={`poster poster--${i + 1}${artist ? '' : ' is-empty'}`}
          >
            <div className="poster__tape poster__tape--tl" />
            <div className="poster__tape poster__tape--tr" />
            <div className="poster__frame">
              {artist?.pixelArt ? (
                <img src={artist.pixelArt} alt="" className="poster__art" />
              ) : (
                <div className="poster__blank" />
              )}
            </div>
            {artist ? (
              <p className="poster__name">{artist.name}</p>
            ) : (
              <div className="poster__name poster__name--empty" />
            )}
          </div>
        )
      })}
    </div>
  )
}
