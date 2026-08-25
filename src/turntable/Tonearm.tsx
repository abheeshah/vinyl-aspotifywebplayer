type Props = {
  playing: boolean
}

export function Tonearm({ playing }: Props) {
  return (
    <div className="tonearm" aria-hidden>
      <div className="tonearm__rest" />
      <div className="tonearm__pivot" />
      <div className={`tonearm__boom ${playing ? 'is-down' : ''}`}>
        <div className="tonearm__collar" />
        <div className="tonearm__arm" />
        <div className="tonearm__counterweight" />
        <div className="tonearm__head">
          <div className="tonearm__cartridge" />
          <div className="tonearm__stylus" />
        </div>
      </div>
    </div>
  )
}
