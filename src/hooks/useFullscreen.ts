import { useEffect, useState } from 'react'

export function useFullscreen() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await document.documentElement.requestFullscreen()
  }

  return { active, toggle }
}
