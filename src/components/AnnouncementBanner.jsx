'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import AnnouncementBadgeIcon from './AnnouncementBadgeIcon'

export default function AnnouncementBanner({ initialAnnouncements = [] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [dismissed, setDismissed] = useState(false)
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setAnnouncements(initialAnnouncements)
    setIdx(0)
    setVisible(true)
    setDismissed(false)
  }, [initialAnnouncements])

  useEffect(() => {
    if (announcements.length < 2) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % announcements.length)
        setVisible(true)
      }, 300)
    }, 7000)
    return () => clearInterval(t)
  }, [announcements.length])

  if (!announcements.length || dismissed) return null

  const current = announcements[idx]

  function goTo(i) {
    setVisible(false)
    setTimeout(() => { setIdx(i); setVisible(true) }, 200)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="announcement-banner relative z-50 border-b border-primary/10 bg-primary text-primary-foreground"
    >
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <AnnouncementBadgeIcon />

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-relaxed transition-all duration-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-0.5'
            }`}
          >
            {current?.text}
          </p>
        </div>

        {announcements.length > 1 && (
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => goTo((idx - 1 + announcements.length) % announcements.length)}
              className="flex h-6 w-6 items-center justify-center rounded text-primary-foreground/60 transition hover:text-primary-foreground hover:bg-white/10"
              aria-label="قبلی"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs tabular-nums text-primary-foreground/50">
              {idx + 1}/{announcements.length}
            </span>
            <button
              type="button"
              onClick={() => goTo((idx + 1) % announcements.length)}
              className="flex h-6 w-6 items-center justify-center rounded text-primary-foreground/60 transition hover:text-primary-foreground hover:bg-white/10"
              aria-label="بعدی"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-primary-foreground/50 transition hover:text-primary-foreground hover:bg-white/10"
          aria-label="بستن"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
