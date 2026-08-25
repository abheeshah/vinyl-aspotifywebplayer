const LEVELS = 6

function posterize(v: number): number {
  return Math.round((v / 255) * (LEVELS - 1)) * (255 / (LEVELS - 1))
}

export async function pixelateImage(url: string, size = 24): Promise<string> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = url
  await img.decode()

  const src = document.createElement('canvas')
  src.width = size
  src.height = size
  const sctx = src.getContext('2d')
  if (!sctx) throw new Error('canvas')
  sctx.imageSmoothingEnabled = false
  sctx.drawImage(img, 0, 0, size, size)

  const { data } = sctx.getImageData(0, 0, size, size)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = posterize(data[i] ?? 0)
    data[i + 1] = posterize(data[i + 1] ?? 0)
    data[i + 2] = posterize(data[i + 2] ?? 0)
  }
  sctx.putImageData(new ImageData(data, size, size), 0, 0)
  return src.toDataURL('image/png')
}

export function largestImageUrl(images: { url: string; width?: number }[]): string | null {
  if (images.length === 0) return null
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  return sorted[0]?.url ?? null
}
