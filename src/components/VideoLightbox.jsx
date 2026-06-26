'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function VideoLightbox({ open, onClose, src, title }) {
  const videoRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      const video = videoRef.current
      if (video) {
        video.pause()
        video.currentTime = 0
      }
      return undefined
    }
    document.body.style.overflow = 'hidden'
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.play().catch(() => {})
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, src])

  function handleEnded() {
    onClose()
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'پخش ویدیو'}
    >
      <button
        type="button"
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن"
      />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-black shadow-2xl ring-2 ring-white/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="بستن"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <video
          ref={videoRef}
          src={src}
          className="aspect-video w-full bg-black object-contain"
          playsInline
          autoPlay
          onEnded={handleEnded}
        />
      </div>
    </div>,
    document.body,
  )
}
