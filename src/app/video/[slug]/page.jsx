'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { siteVideos } from '@/data/siteVideos'

export default function SiteVideoPage() {
  const { slug } = useParams()
  const router = useRouter()
  const videoRef = useRef(null)
  const video = siteVideos[slug]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const el = videoRef.current
    if (el) {
      el.play().catch(() => {})
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [video])

  function handleClose() {
    router.push(video?.returnTo || '/')
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-center text-white">
        <div>
          <p className="text-lg font-bold">ویدیو یافت نشد.</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-4 rounded-full bg-white/15 px-5 py-2 text-sm font-bold transition hover:bg-white/25"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <button
        type="button"
        onClick={handleClose}
        className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
        aria-label="بستن"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative h-full w-full max-w-5xl p-4 sm:p-8">
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          className="h-full w-full object-contain"
          playsInline
          autoPlay
          controls
          onEnded={handleClose}
        />
      </div>
    </div>
  )
}
