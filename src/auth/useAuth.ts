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

export function useAuth(clientId: string | undefined) {
  const [authed, setAuthed] = useState(() => Boolean(loadTokens()))
  const [callbackError, setCallbackError] = useState<string | null>(null)
  const [handlingCallback, setHandlingCallback] = useState(
    () => window.location.pathname === '/callback',
  )

  useEffect(() => {
    if (window.location.pathname !== '/callback') return
    if (!clientId) {
      setCallbackError('MISSING CLIENT ID')
      setHandlingCallback(false)
      return
    }

    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    const code = params.get('code')
    const verifier = takeVerifier()

    const finish = () => {
      window.history.replaceState({}, '', '/')
      setHandlingCallback(false)
    }

    if (err) {
      setCallbackError(formatAuthError(err))
      finish()
      return
    }
    if (!code || !verifier) {
      setCallbackError('LOGIN INCOMPLETE')
      finish()
      return
    }

    void exchangeCode(clientId, code, verifier)
      .then(() => {
        setAuthed(true)
        finish()
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : ''
        if (/not.?authorized|403|forbidden/i.test(msg)) {
          setCallbackError(formatAuthError('user_not_authorized'))
        } else {
          setCallbackError('TOKEN EXCHANGE FAILED')
        }
        finish()
      })
  }, [clientId])

  return { authed, callbackError, handlingCallback }
}
