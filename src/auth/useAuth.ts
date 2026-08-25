import { useEffect, useState } from 'react'
import { exchangeCode, loadTokens } from '../auth/tokenStore'
import { takeVerifier } from './pkce'

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
      setCallbackError(err.replaceAll('_', ' ').toUpperCase())
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
      .catch(() => {
        setCallbackError('TOKEN EXCHANGE FAILED')
        finish()
      })
  }, [clientId])

  return { authed, callbackError, handlingCallback }
}
