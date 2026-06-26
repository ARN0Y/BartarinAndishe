'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react'
function GalleryCaption({ caption, isVideo }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 sm:p-3">
      <div className="overflow-hidden rounded-md shadow-lg ring-1 ring-white/20 backdrop-blur-md">
        <span className="flex min-w-0 items-center gap-1.5 bg-black/55 px-3 py-2 text-[11px] font-medium leading-snug text-white sm:text-xs">
          {isVideo && (
            <Play className="h-3 w-3 shrink-0 fill-current" />
          )}
          <span className="truncate">{caption}</span>
        </span>
      </div>
    </div>
  )
}

export default function HeroGalleryCard({
  item,
  index,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  onImageClick,
}) {
  const isVideo = item.type === 'video'
  const videoRef = useRef(null)
  const rootRef = useRef(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!isVideo || !videoRef.current || !rootRef.current) return

    const video = videoRef.current
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          video.play().then(() => {
            setPlaying(true)
            onVideoPlay?.()
          }).catch(() => setPlaying(false))
        } else {
          video.pause()
          setPlaying(false)
          onVideoPause?.()
        }
      },
      { threshold: [0, 0.55, 0.85] }
    )

    obs.observe(rootRef.current)
    return () => obs.disconnect()
  }, [isVideo, onVideoPlay, onVideoPause])

  function handleVideoEnded() {
    setPlaying(false)
    onVideoEnded?.()
  }

  function toggleMute(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!videoRef.current) return
    const next = !muted
    videoRef.current.muted = next
    setMuted(next)
    if (!next) videoRef.current.play().catch(() => {})
  }

  function handleClick() {
    if (!isVideo && onImageClick) {
      onImageClick()
    }
  }

  const widthClass = isVideo
    ? 'w-[270px] sm:w-[320px] md:w-[348px]'
    : 'w-[250px] sm:w-[296px] md:w-[320px]'

  return (
    <article
      ref={rootRef}
      className={`hero-gallery-card group ${widthClass} ${!isVideo ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${(index % 6) * 0.08}s` }}
      onClick={handleClick}
    >
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-background p-1 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-pink-deep/30 group-hover:shadow-lg"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={item.src}
                poster={item.poster}
                muted={muted}
                playsInline
                loop={false}
                onEnded={handleVideoEnded}
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
                aria-label={item.caption}
              />
              <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-pink-deep shadow-md backdrop-blur-sm">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className="absolute top-2.5 right-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
                aria-label={muted ? 'فعال‌سازی صدا' : 'قطع صدا'}
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              {!playing && (
                <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" aria-hidden />
              )}
            </>
          ) : (
            <>
              <img
                src={item.src}
                alt={item.caption}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              <div className="absolute top-2.5 left-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-md bg-white/85 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" />
              </div>
            </>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden />
          <GalleryCaption caption={item.caption} isVideo={isVideo} />
        </div>
      </div>
    </article>
  )
}
