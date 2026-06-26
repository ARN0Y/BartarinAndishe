'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export default function GalleryModal({ title, subtitle, description, gallery, onClose, onFinished }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [animDir, setAnimDir] = useState('next') // 'next' | 'prev'
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  const goTo = useCallback((idx, dir = 'next') => {
    setAnimDir(dir)
    setVisible(false)
    setTimeout(() => {
      setActiveIndex(idx)
      setVisible(true)
    }, 220)
  }, [])

  const prev = useCallback(() => {
    goTo((activeIndex - 1 + gallery.length) % gallery.length, 'prev')
  }, [activeIndex, gallery.length, goTo])

  const next = useCallback(() => {
    goTo((activeIndex + 1) % gallery.length, 'next')
  }, [activeIndex, gallery.length, goTo])

  // اسلایدشو خودکار ۳ ثانیه — بعد از آخرین عکس بسته می‌شود
  useEffect(() => {
    if (paused || gallery.length <= 1) return
    timerRef.current = setTimeout(() => {
      const isLast = activeIndex === gallery.length - 1
      if (isLast) {
        // آخرین عکس — مودال را ببند و به موضوع بعدی برو
        onClose()
        if (onFinished) onFinished()
      } else {
        setAnimDir('next')
        setVisible(false)
        setTimeout(() => {
          setActiveIndex((i) => i + 1)
          setVisible(true)
        }, 220)
      }
    }, 3000)
    return () => clearTimeout(timerRef.current)
  }, [paused, gallery.length, activeIndex, onClose, onFinished])

  // کیبورد
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') { setPaused(true); next() }
      if (e.key === 'ArrowRight') { setPaused(true); prev() }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, next, prev])

  const current = gallery[activeIndex]

  const slideStyle = {
    transition: 'opacity 220ms ease, transform 220ms ease',
    opacity: visible ? 1 : 0,
    transform: visible
      ? 'translateX(0)'
      : animDir === 'next'
        ? 'translateX(-20px)'
        : 'translateX(20px)',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن"
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between bg-gradient-to-l from-navy to-navy-dark px-5 py-3.5">
          <div>
            {subtitle && <span className="block text-[10px] font-bold uppercase tracking-widest text-pink-soft">{subtitle}</span>}
            <h2 className="text-sm font-extrabold text-white sm:text-base">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* دکمه پاز/پلی */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label={paused ? 'شروع اسلایدشو' : 'توقف اسلایدشو'}
                title={paused ? 'شروع اسلایدشو' : 'توقف اسلایدشو'}
              >
                {paused ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label="بستن"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* نوار پیشرفت اسلایدشو */}
        {gallery.length > 1 && !paused && (
          <div className="h-0.5 w-full bg-white/10 overflow-hidden">
            <div
              key={`${activeIndex}-progress`}
              className="h-full bg-pink-deep"
              style={{
                animation: 'slideProgress 3s linear forwards',
              }}
            />
          </div>
        )}

        {/* تصویر اصلی */}
        <div
          className="relative bg-slate-900"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
            <div style={slideStyle} className="h-full w-full">
              <img
                src={current?.src}
                alt={current?.caption || title}
                className="h-full w-full object-contain"
              />
            </div>

            {current?.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pb-4 pt-10 pointer-events-none">
                <p className="text-sm font-semibold text-white drop-shadow">{current.caption}</p>
              </div>
            )}

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => { setPaused(true); prev() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 hover:scale-110"
                  aria-label="قبلی"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaused(true); next() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 hover:scale-110"
                  aria-label="بعدی"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </>
            )}

            {/* شماره عکس */}
            {gallery.length > 1 && (
              <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                {activeIndex + 1} / {gallery.length}
              </span>
            )}
          </div>

          {/* dots */}
          {gallery.length > 1 && (
            <div className="flex justify-center gap-2 bg-slate-900 py-2.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setPaused(true); goTo(i, i > activeIndex ? 'next' : 'prev') }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'w-6 bg-pink-deep' : 'w-2 bg-white/30 hover:bg-white/55'
                  }`}
                  aria-label={`تصویر ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* thumbnails */}
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-slate-50 px-4 py-3">
            {gallery.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setPaused(true); goTo(i, i > activeIndex ? 'next' : 'prev') }}
                className={`relative shrink-0 h-14 w-20 overflow-hidden rounded-xl transition-all duration-200 ${
                  i === activeIndex
                    ? 'ring-2 ring-pink-deep ring-offset-1 opacity-100 scale-105'
                    : 'opacity-55 hover:opacity-85 hover:scale-105'
                }`}
              >
                <img src={img.src} alt={img.caption || ''} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* توضیحات + بستن */}
        {description && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-sm leading-7 text-slate-600">{description}</p>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            بستن
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
