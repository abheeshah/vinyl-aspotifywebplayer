import { beginLogin } from './auth/pkce'
import { useAuth } from './auth/useAuth'
import { useFullscreen } from './hooks/useFullscreen'
import { useKeyboard } from './hooks/useKeyboard'
import { usePixelScale } from './hooks/usePixelScale'
import { RoomScene } from './scene/RoomScene'
import { useSpotifyPlayer } from './spotify/useSpotifyPlayer'
import './styles/tokens.css'
import './styles/room.css'

const RAW_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined
const CLIENT_ID =
  RAW_CLIENT_ID &&
  RAW_CLIENT_ID !== 'your_spotify_client_id' &&
  RAW_CLIENT_ID.trim().length > 0
    ? RAW_CLIENT_ID.trim()
    : undefined

export default function App() {
  const scale = usePixelScale()
  const { active, toggle } = useFullscreen()
  const { authed, callbackError, handlingCallback } = useAuth(CLIENT_ID)
  const player = useSpotifyPlayer(CLIENT_ID, authed && !handlingCallback)

  useKeyboard(player, () => void toggle(), authed && player.ready)

  return (
    <RoomScene
      scale={scale}
      fullscreen={active}
      onFullscreen={() => void toggle()}
      authed={authed}
      handlingCallback={handlingCallback}
      clientMissing={!CLIENT_ID}
      error={player.error}
      callbackError={callbackError}
      ready={player.ready}
      paused={player.paused}
      positionMs={player.positionMs}
      volume={player.volume}
      track={player.track}
      pixelArt={player.pixelArt}
      queue={player.queue}
      topArtists={player.topArtists}
      spectrum={player.spectrum}
      pulse={player.pulse}
      onConnect={() => {
        if (CLIENT_ID) void beginLogin(CLIENT_ID)
      }}
      onToggle={player.togglePlay}
      onPrev={player.previous}
      onNext={player.next}
      onSeek={player.seek}
      onVolume={player.setVolume}
    />
  )
}
