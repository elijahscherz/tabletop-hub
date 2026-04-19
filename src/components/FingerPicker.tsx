import { useEffect, useRef, useState, type TouchEvent } from 'react'

type ActiveTouch = {
  id: number
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function FingerPicker() {
  const areaRef = useRef<HTMLDivElement | null>(null)
  const [touches, setTouches] = useState<ActiveTouch[]>([])
  const [pickedTouchId, setPickedTouchId] = useState<number | null>(null)
  const [status, setStatus] = useState('Place at least two fingers on the screen and hold for a moment.')

  useEffect(() => {
    if (pickedTouchId !== null || touches.length < 2) {
      return
    }

    setStatus(`Locking in ${touches.length} fingers...`)

    const timeoutId = window.setTimeout(() => {
      const chosen = touches[Math.floor(Math.random() * touches.length)]
      setPickedTouchId(chosen?.id ?? null)
      setStatus('Chosen finger highlighted.')
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [pickedTouchId, touches])

  function mapTouches(event: TouchEvent<HTMLDivElement>) {
    const bounds = areaRef.current?.getBoundingClientRect()

    if (!bounds) {
      return []
    }

    return Array.from(event.touches).map((touch) => ({
      id: touch.identifier,
      x: clamp(((touch.clientX - bounds.left) / bounds.width) * 100, 8, 92),
      y: clamp(((touch.clientY - bounds.top) / bounds.height) * 100, 10, 90),
    }))
  }

  function updateTouches(event: TouchEvent<HTMLDivElement>) {
    const nextTouches = mapTouches(event)
    setTouches(nextTouches)

    if (nextTouches.length === 0) {
      setPickedTouchId(null)
      setStatus('Place at least two fingers on the screen and hold for a moment.')
      return
    }

    if (pickedTouchId !== null && !nextTouches.some((touch) => touch.id === pickedTouchId)) {
      setPickedTouchId(null)
    }

    if (nextTouches.length === 1 && pickedTouchId === null) {
      setStatus('Add one more finger to make a pick.')
    }
  }

  const readyCount = touches.length

  return (
    <div className="finger-picker-shell">
      <div
        className={`finger-picker-stage${pickedTouchId !== null ? ' has-selection' : ''}`}
        onTouchCancel={updateTouches}
        onTouchEnd={updateTouches}
        onTouchMove={updateTouches}
        onTouchStart={updateTouches}
        ref={areaRef}
      >
        <div className="finger-picker-grid" aria-hidden="true" />
        {touches.map((touch) => (
          <div
            className={`finger-picker-touch${pickedTouchId === touch.id ? ' is-picked' : ''}`}
            key={touch.id}
            style={{ left: `${touch.x}%`, top: `${touch.y}%` }}
          />
        ))}
        <div className="finger-picker-copy">
          <p className="mini-heading">Finger picker</p>
          <h3>{readyCount < 2 ? 'Waiting for fingers' : pickedTouchId === null ? 'Hold steady...' : 'Winner chosen'}</h3>
          <p>{status}</p>
        </div>
      </div>
      <p className="tools-note">Best on phones or tablets. Multi-touch in the browser is enough for this kind of picker, so yes, this works on the web.</p>
    </div>
  )
}
