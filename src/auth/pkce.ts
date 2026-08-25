const VERIFIER_KEY = 'vinyl_pkce_verifier'
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ')

/** Spotify rejects `localhost`; loopback must be an IP literal (http://127.0.0.1:PORT). */
export function redirectUri(): string {
  const { protocol, hostname, port } = window.location
  const host =
    hostname === 'localhost' || hostname === '[::1]' || hostname === '::1'
      ? '127.0.0.1'
      : hostname
  const portPart = port ? `:${port}` : ''
  return `${protocol}//${host}${portPart}/callback`
}

function randomVerifier(): string {
  const bytes = new Uint8Array(64)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function challengeFrom(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function beginLogin(clientId: string): Promise<void> {
  const verifier = randomVerifier()
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const challenge = await challengeFrom(verifier)
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: randomVerifier().slice(0, 16),
  })
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`)
}

export function takeVerifier(): string | null {
  const v = sessionStorage.getItem(VERIFIER_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)
  return v
}
