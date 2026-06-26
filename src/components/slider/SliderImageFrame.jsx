'use client'

import { ACCENT_THEMES } from './SliderDecorations'
import { SoftWave } from './SliderDecorations'

/**
 * فریم تصویر با کیفیت بالا، لایه رنگی ملایم و حاشیه پاستلی
 */
export default function SliderImageFrame({
  src,
  alt,
  accent = 'pink',
  aspectClass = 'aspect-[16/10] sm:aspect-[16/9]',
  priority = false,
  className = '',
  showWave = true,
  children,
}) {
  const theme = ACCENT_THEMES[accent] || ACCENT_THEMES.pink

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-card p-1.5 shadow-sm transition-all duration-300 group-hover:border-pink-deep/30 group-hover:shadow-lg sm:p-2"
      >
        <div className={`relative overflow-hidden rounded-md bg-muted shadow-inner ${aspectClass}`}>
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="slider-image-premium absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />

          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.overlay}`}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
            aria-hidden
          />

          {showWave && <SoftWave />}
          {children}
        </div>
      </div>
    </div>
  )
}
