import { useEffect, useState } from 'react'
import { exchangeCode, loadTokens } from '../auth/tokenStore'
import { takeVerifier } from './pkce'

/** Map Spotify OAuth error codes to short CRT-friendly messages. */
export function formatAuthError(raw: string): string {
  const key = raw.trim().toLowerCase().replaceAll(' ', '_')
  switch (key) {
    case 'access_denied':
      return 'ACCESS DENIED'
    case 'user_not_authorized':
    case 'unauthorized_client':
      return 'NOT ON ALLOWLIST — ADD EMAIL IN SPOTIFY DASHBOARD'
    case 'invalid_client':
      return 'BAD CLIENT ID'
    case 'invalid_grant':
      return 'LOGIN EXPIRED — CONNECT AGAIN'
    case 'invalid_scope':
      return 'SCOPE REJECTED'
    default:
      return raw.replaceAll('_', ' ').toUpperCase()
  }
}

type CallbackIntent =
  | { kind: 'none' }
  | { kind: 'error'; message: string }
  | { kind: 'exchange'; clientId: string; code: string; verifier: string }

let cachedIntent: CallbackIntent | null = null

function readCallbackIntent(clientId: string | undefined): CallbackIntent {
  if (window.location.pathname !== '/callback') return { kind: 'none' }
  if (!clientId) return { kind: 'error', message: 'MISSING CLIENT ID' }

  const params = new URLSearchParams(window.location.search)
  const err = params.get('error')
  if (err) return { kind: 'error', message: formatAuthError(err) }

  const code = params.get('code')
  const verifier = takeVerifier()
  if (!code || !verifier) return { kind: 'error', message: 'LOGIN INCOMPLETE' }
  return { kind: 'exchange', clientId, code, verifier }
}

/**
 * The PKCE verifier is single-use, so the callback URL may only be read once per
 * page load — StrictMode remounts and re-renders must reuse the same result.
 */
function callbackIntent(clientId: string | undefined): CallbackIntent {
  cachedIntent ??= readCallbackIntent(clientId)
  return cachedIntent
}

export function useAuth(clientId: string | undefined) {
  const intent = callbackIntent(clientId)
  const [authed, setAuthed] = useState(() => Boolean(loadTokens()))
  const [callbackError, setCallbackError] = useState<string | null>(
    intent.kind === 'error' ? intent.message : null,
  )
  const [handlingCallback, setHandlingCallback] = useState(intent.kind === 'exchange')

  useEffect(() => {
    if (intent.kind === 'none') return

    window.history.replaceState({}, '', '/')
    if (intent.kind === 'error') return

    void exchangeCode(intent.clientId, intent.code, intent.verifier)
      .then(() => {
        setAuthed(true)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : ''
        if (/not.?authorized|403|forbidden/i.test(msg)) {
          setCallbackError(formatAuthError('user_not_authorized'))
        } else {
          setCallbackError('TOKEN EXCHANGE FAILED')
        }
      })
      .finally(() => {
        setHandlingCallback(false)
      })
  }, [intent])

  return { authed, callbackError, handlingCallback }
}
