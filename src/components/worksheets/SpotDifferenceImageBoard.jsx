'use client'

import { useRef, useState } from 'react'

/** تبدیل کلیک/اشاره‌گر به مختصات نسبی ۰–۱ روی تصویر */
export function pointToNormalized(container, clientX, clientY) {
  const rect = container.getBoundingClientRect()
  const x = (clientX - rect.left) / rect.width
  const y = (clientY - rect.top) / rect.height
  return {
    centerX: Math.min(1, Math.max(0, x)),
    centerY: Math.min(1, Math.max(0, y)),
  }
}

export function clickToNormalized(event) {
  return pointToNormalized(event.currentTarget, event.clientX, event.clientY)
}

export function hitTestSpot(spots, nx, ny, foundIds = new Set()) {
  for (const spot of spots) {
    const id = spot.id ?? spot.tempId
    if (foundIds.has(id)) continue
    const dx = nx - spot.centerX
    const dy = ny - spot.centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= (spot.radius || 0.07)) return spot
  }
  return null
}

function findSpotIndexAtPoint(spots, point) {
  for (let i = spots.length - 1; i >= 0; i -= 1) {
    const spot = spots[i]
    const dx = point.centerX - spot.centerX
    const dy = point.centerY - spot.centerY
    if (Math.sqrt(dx * dx + dy * dy) <= (spot.radius || 0.07)) return i
  }
  return -1
}

export default function SpotDifferenceImageBoard({
  src,
  alt,
  spots = [],
  foundIds = new Set(),
  selectedSpotKey = null,
  onImageClick,
  onSpotSelect,
  onSpotMove,
  onAddSpot,
  editable = false,
  interactive = false,
  label,
  mode = 'edit',
}) {
  const containerRef = useRef(null)
  const dragRef = useRef({ index: null, moved: false })
  const [draggingIndex, setDraggingIndex] = useState(null)

  const visibleSpots =
    mode === 'play'
      ? spots.filter((spot) => foundIds.has(spot.id ?? spot.tempId))
      : spots

  function handlePointerDown(event) {
    if (!editable || !containerRef.current) return
    event.preventDefault()
    containerRef.current.setPointerCapture(event.pointerId)

    const point = pointToNormalized(containerRef.current, event.clientX, event.clientY)
    const hitIndex = findSpotIndexAtPoint(spots, point)

    if (hitIndex >= 0) {
      dragRef.current = { index: hitIndex, moved: false }
      setDraggingIndex(hitIndex)
      onSpotSelect?.(hitIndex)
      return
    }

    dragRef.current = { index: null, moved: false }
    onAddSpot?.(point)
  }

  function handlePointerMove(event) {
    if (!editable || dragRef.current.index == null || !containerRef.current) return

    const point = pointToNormalized(containerRef.current, event.clientX, event.clientY)
    dragRef.current.moved = true
    onSpotMove?.(dragRef.current.index, point)
  }

  function handlePointerUp(event) {
    if (!editable || !containerRef.current) return

    if (containerRef.current.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId)
    }

    dragRef.current = { index: null, moved: false }
    setDraggingIndex(null)
  }

  const useLegacyClick = interactive && !editable && onImageClick

  return (
    <div className="space-y-2">
      {label ? <p className="text-center text-xs font-bold text-slate-600">{label}</p> : null}
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl bg-white ring-2 ring-slate-200 touch-none ${
          editable ? 'cursor-crosshair' : interactive ? 'cursor-crosshair' : ''
        } ${draggingIndex != null ? 'cursor-grabbing' : editable ? 'cursor-crosshair' : ''}`}
        onPointerDown={editable ? handlePointerDown : undefined}
        onPointerMove={editable ? handlePointerMove : undefined}
        onPointerUp={editable ? handlePointerUp : undefined}
        onPointerCancel={editable ? handlePointerUp : undefined}
        onClick={useLegacyClick ? onImageClick : undefined}
        role={interactive || editable ? 'button' : undefined}
        tabIndex={interactive || editable ? 0 : undefined}
      >
        <img src={src} alt={alt} className="block w-full select-none" draggable={false} />
        {visibleSpots.map((spot, index) => {
          const id = spot.id ?? spot.tempId
          const key = id ?? index
          const found = foundIds.has(id)
          const selected = selectedSpotKey != null && selectedSpotKey === key
          const dragging = draggingIndex === index
          const showNumber = mode === 'edit' || found
          return (
            <div
              key={id ?? index}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${
                dragging ? '' : 'transition-all duration-300'
              }`}
              style={{
                left: `${spot.centerX * 100}%`,
                top: `${spot.centerY * 100}%`,
                width: `${(spot.radius || 0.07) * 200}%`,
                height: `${(spot.radius || 0.07) * 200}%`,
                borderColor: selected || dragging ? '#8b5cf6' : found ? '#22c55e' : '#f59e0b',
                backgroundColor: selected || dragging
                  ? 'rgba(139,92,246,0.2)'
                  : found
                    ? 'rgba(34,197,94,0.25)'
                    : 'rgba(245,158,11,0.15)',
                boxShadow: selected || dragging ? '0 0 0 3px rgba(139,92,246,0.35)' : undefined,
              }}
            >
              {showNumber ? (
                <span
                  className={`absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-extrabold text-white shadow ${
                    found ? 'bg-green-500' : selected || dragging ? 'bg-violet-500' : 'bg-amber-500'
                  }`}
                >
                  {found ? '✓' : index + 1}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
