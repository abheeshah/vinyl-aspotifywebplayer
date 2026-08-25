import { useEffect } from 'react'
import type { PlayerModel } from '../spotify/useSpotifyPlayer'

export function useKeyboard(
  player: PlayerModel,
  onFullscreen: () => void,
  onTogglePosters: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'spacebar') {
        e.preventDefault()
        player.togglePlay()
        return
      }
      if (key === 'arrowleft') {
        e.preventDefault()
        player.previous()
        return
      }
      if (key === 'arrowright') {
        e.preventDefault()
        player.next()
        return
      }
      if (key === 'arrowup') {
        e.preventDefault()
        player.setVolume(player.volume + 0.08)
        return
      }
      if (key === 'arrowdown') {
        e.preventDefault()
        player.setVolume(player.volume - 0.08)
        return
      }
      if (key === 'f') {
        e.preventDefault()
        onFullscreen()
        return
      }
      if (key === 'p') {
        e.preventDefault()
        onTogglePosters()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, onFullscreen, onTogglePosters, player])
}
