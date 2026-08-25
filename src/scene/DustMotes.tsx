import type { CSSProperties } from 'react'

type Props = {
  count?: number
  quiet?: boolean
}

export function DustMotes({ count = 18, quiet }: Props) {
  return (
    <div className={`dust ${quiet ? 'dust--quiet' : ''}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="mote" style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  )
}
