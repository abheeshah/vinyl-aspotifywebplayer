export function Plant() {
  return (
    <div className="plant" aria-hidden>
      <div className="plant__foliage">
        <div className="plant__stem plant__stem--main" />
        <div className="plant__stem plant__stem--l" />
        <div className="plant__stem plant__stem--r" />
        <div className="plant__stem plant__stem--top" />
        <div className="plant__leaf plant__leaf--a" />
        <div className="plant__leaf plant__leaf--b" />
        <div className="plant__leaf plant__leaf--c" />
        <div className="plant__leaf plant__leaf--d" />
        <div className="plant__leaf plant__leaf--e" />
        <div className="plant__leaf plant__leaf--f" />
      </div>
      <div className="plant__pot">
        <div className="plant__rim" />
        <div className="plant__glaze" />
      </div>
      <div className="plant__soil" />
    </div>
  )
}
