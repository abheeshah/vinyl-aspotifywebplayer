type Props = {
  pulse: boolean
}

export function SpeakerPair({ pulse }: Props) {
  return (
    <>
      <Speaker className="speaker--left" pulse={pulse} />
      <Speaker className="speaker--right" pulse={pulse} />
    </>
  )
}

function Speaker({ className, pulse }: { className: string; pulse: boolean }) {
  return (
    <div className={`speaker ${className}`} aria-hidden>
      <div className="speaker__wood">
        <div className={`speaker__woofer ${pulse ? 'is-pulse' : ''}`}>
          <div className="speaker__cone" />
          <div className="speaker__dustcap" />
        </div>
        <div className="speaker__tweeter" />
        <div className="speaker__grille" />
      </div>
    </div>
  )
}
