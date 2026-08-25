import { useLayoutEffect, useState } from 'react'

export const STAGE_W = 480
export const STAGE_H = 270

export function usePixelScale() {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const fit = () => {
      const raw = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
      setScale(raw >= 1 ? Math.floor(raw) : Math.max(raw, 0.5))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return scale
}
