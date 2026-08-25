import { useEffect, useRef } from 'react'

type Props = {
  spinning: boolean
  coasting: boolean
  pixelArt: string | null
}

/** Internal raster — displayed at 72×72 via nearest-neighbor (2×). */
const PX = 36
const DISPLAY = 72

const GROOVE = ['#060606', '#121212', '#0a0a0a', '#181818'] as const
const LABEL_BG = '#c42c2c'
const LABEL_RIM = '#8a1818'
const SPINDLE = '#f4e4c4'
const GLINT = '#3a2818'
const EDGE = '#1c1c1c'

function inCircle(x: number, y: number, cx: number, cy: number, r: number): boolean {
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

async function paintVinyl(
  ctx: CanvasRenderingContext2D,
  pixelArt: string | null,
): Promise<void> {
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, PX, PX)

  const cx = (PX - 1) / 2
  const cy = (PX - 1) / 2
  const outerR = PX / 2 - 0.5
  const labelR = PX * 0.22
  const rimR = labelR + 1.25
  const spindleR = 1.35

  for (let y = 0; y < PX; y++) {
    for (let x = 0; x < PX; x++) {
      const dist = Math.hypot(x - cx, y - cy)
      if (dist > outerR) continue

      if (dist <= spindleR) {
        ctx.fillStyle = SPINDLE
      } else if (dist <= labelR) {
        ctx.fillStyle = LABEL_BG
      } else if (dist <= rimR) {
        ctx.fillStyle = LABEL_RIM
      } else if (dist > outerR - 0.9) {
        ctx.fillStyle = EDGE
      } else {
        const band = Math.floor(dist * 1.4) % GROOVE.length
        ctx.fillStyle = GROOVE[band] ?? '#080808'
      }
      ctx.fillRect(x, y, 1, 1)
    }
  }

  // Stamp pixel album art into label circle
  if (pixelArt) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = pixelArt
      await img.decode()

      const labelPx = Math.max(8, Math.floor(labelR * 2))
      const lx = Math.round(cx - labelPx / 2)
      const ly = Math.round(cy - labelPx / 2)
      const off = document.createElement('canvas')
      off.width = labelPx
      off.height = labelPx
      const octx = off.getContext('2d')
      if (octx) {
        octx.imageSmoothingEnabled = false
        octx.drawImage(img, 0, 0, labelPx, labelPx)
        const stamp = octx.getImageData(0, 0, labelPx, labelPx)
        for (let y = 0; y < labelPx; y++) {
          for (let x = 0; x < labelPx; x++) {
            const wx = lx + x
            const wy = ly + y
            if (!inCircle(wx, wy, cx, cy, labelR)) continue
            if (inCircle(wx, wy, cx, cy, spindleR)) continue
            const i = (y * labelPx + x) * 4
            const a = stamp.data[i + 3] ?? 0
            if (a < 8) continue
            ctx.fillStyle = `rgb(${stamp.data[i]},${stamp.data[i + 1]},${stamp.data[i + 2]})`
            ctx.fillRect(wx, wy, 1, 1)
          }
        }
      }
    } catch {
      // keep flat label
    }
  } else {
    // Tiny cream bar on blank label
    ctx.fillStyle = '#f4e4c4'
    ctx.fillRect(Math.round(cx) - 3, Math.round(cy) - 1, 6, 2)
    // restore spindle over bar
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        if (inCircle(x, y, cx, cy, spindleR)) {
          ctx.fillStyle = SPINDLE
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }

  // Static glint pixels (spin with disc)
  const glints: [number, number][] = [
    [Math.round(cx - 8), Math.round(cy - 10)],
    [Math.round(cx - 7), Math.round(cy - 9)],
    [Math.round(cx + 9), Math.round(cy + 6)],
  ]
  for (const [gx, gy] of glints) {
    if (inCircle(gx, gy, cx, cy, outerR) && !inCircle(gx, gy, cx, cy, rimR)) {
      ctx.fillStyle = GLINT
      ctx.fillRect(gx, gy, 1, 1)
    }
  }
}

export function VinylDisc({ spinning, coasting, pixelArt }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spinClass = spinning ? 'is-spinning' : coasting ? 'is-coasting' : 'is-stopped'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let live = true
    const off = document.createElement('canvas')
    off.width = PX
    off.height = PX
    const octx = off.getContext('2d')
    if (!octx) return

    void paintVinyl(octx, pixelArt).then(() => {
      if (!live) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, PX, PX)
      ctx.drawImage(off, 0, 0)
    })
    return () => {
      live = false
    }
  }, [pixelArt])

  return (
    <canvas
      ref={canvasRef}
      className={`vinyl ${spinClass}`}
      width={PX}
      height={PX}
      aria-hidden
      style={{ width: DISPLAY, height: DISPLAY }}
    />
  )
}
