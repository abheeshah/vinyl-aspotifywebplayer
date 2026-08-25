interface Window {
  onSpotifyWebPlaybackSDKReady: () => void
  Spotify: typeof Spotify
}

declare namespace Spotify {
  interface Error {
    message: string
  }

  interface PlaybackTrack {
    uri: string
    id: string | null
    type: string
    name: string
    duration_ms: number
    artists: { name: string; uri: string }[]
    album: {
      name: string
      uri: string
      images: { url: string; height?: number; width?: number }[]
    }
  }

  interface PlaybackTrackWindow {
    current_track: PlaybackTrack
    previous_tracks: PlaybackTrack[]
    next_tracks: PlaybackTrack[]
  }

  interface PlaybackState {
    paused: boolean
    position: number
    duration: number
    repeat_mode: number
    shuffle: boolean
    timestamp: number
    track_window: PlaybackTrackWindow
  }

  interface PlayerInit {
    name: string
    getOAuthToken: (cb: (token: string) => void) => void
    volume?: number
    enableMediaSession?: boolean
  }

  class Player {
    constructor(options: PlayerInit)
    connect(): Promise<boolean>
    disconnect(): void
    addListener(event: 'ready', cb: (state: { device_id: string }) => void): boolean
    addListener(event: 'not_ready', cb: (state: { device_id: string }) => void): boolean
    addListener(event: 'player_state_changed', cb: (state: PlaybackState | null) => void): boolean
    addListener(
      event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error',
      cb: (err: Error) => void,
    ): boolean
    removeListener(event: string): boolean
    getCurrentState(): Promise<PlaybackState | null>
    setName(name: string): Promise<void>
    getVolume(): Promise<number>
    setVolume(volume: number): Promise<void>
    pause(): Promise<void>
    resume(): Promise<void>
    togglePlay(): Promise<void>
    seek(position_ms: number): Promise<void>
    previousTrack(): Promise<void>
    nextTrack(): Promise<void>
    activateElement(): Promise<void>
  }
}
