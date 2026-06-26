'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#c75b94', '#ff8ec4']

function randomPiece() {
  return {
    id: Math.random(),
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.4}s`,
    duration: `${1.2 + Math.random() * 1}s`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: `${Math.random() * 360}deg`,
    size: 6 + Math.random() * 8,
  }
}

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) {
      setPieces([])
      return
    }
    setPieces(Array.from({ length: 48 }, randomPiece))
    const t = setTimeout(() => setPieces([]), 2200)
    return () => clearTimeout(t)
  }, [active])

  if (!pieces.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block rounded-sm"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  )
}
