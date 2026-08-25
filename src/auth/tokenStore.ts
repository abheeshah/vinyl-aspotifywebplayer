import { redirectUri } from './pkce'

const STORE_KEY = 'vinyl_tokens_v2'

export type TokenSet = {
  access_token: string
  refresh_token: string
  expires_at: number
}

export function loadTokens(): TokenSet | null {
  const raw = sessionStorage.getItem(STORE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as TokenSet
    if (!parsed.access_token || !parsed.refresh_token) return null
    return parsed
  } catch {
    return null
  }
}

export function saveTokens(tokens: TokenSet): void {
  sessionStorage.setItem(STORE_KEY, JSON.stringify(tokens))
}

export function clearTokens(): void {
  sessionStorage.removeItem(STORE_KEY)
}

function fromSpotify(json: {
  access_token: string
  refresh_token?: string
  expires_in: number
}, prev?: TokenSet | null): TokenSet {
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token ?? prev?.refresh_token ?? '',
    expires_at: Date.now() + json.expires_in * 1000 - 30_000,
  }
}

export async function exchangeCode(clientId: string, code: string, verifier: string): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    client_id: clientId,
    code_verifier: verifier,
  })
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`token exchange failed (${res.status})`)
  const json = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }
  const tokens = fromSpotify(json)
  saveTokens(tokens)
  return tokens
}

export async function refreshTokens(clientId: string, prev: TokenSet): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: prev.refresh_token,
    client_id: clientId,
  })
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    clearTokens()
    throw new Error(`token refresh failed (${res.status})`)
  }
  const json = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }
  const tokens = fromSpotify(json, prev)
  saveTokens(tokens)
  return tokens
}

export async function validAccessToken(clientId: string): Promise<string | null> {
  let tokens = loadTokens()
  if (!tokens) return null
  if (Date.now() >= tokens.expires_at) {
    tokens = await refreshTokens(clientId, tokens)
  }
  return tokens.access_token
}
