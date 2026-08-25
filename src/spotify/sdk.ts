export function loadSpotifySdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const prev = window.onSpotifyWebPlaybackSDKReady
    window.onSpotifyWebPlaybackSDKReady = () => {
      prev?.()
      resolve()
    }

    if (!document.querySelector('script[data-spotify-sdk]')) {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      script.dataset.spotifySdk = '1'
      script.onerror = () => reject(new Error('SDK failed to load'))
      document.head.appendChild(script)
    }
  })
}
