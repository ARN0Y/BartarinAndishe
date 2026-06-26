'use client'

import { useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode } from 'swiper/modules'
import HeroGalleryCard from './slider/HeroGalleryCard'
import 'swiper/css'
import 'swiper/css/free-mode'

export default function ContentGallerySection({ section }) {
  const swiperRef = useRef(null)
  const { id, badge, title, subtitle, strip } = section

  const handleVideoPlay = useCallback(() => {
    swiperRef.current?.swiper?.autoplay?.stop()
  }, [])

  const handleVideoPause = useCallback(() => {
    swiperRef.current?.swiper?.autoplay?.start()
  }, [])

  const handleVideoEnded = useCallback(() => {
    const swiper = swiperRef.current?.swiper
    if (!swiper) return
    swiper.slideNext()
    swiper.autoplay?.start()
  }, [])

  const galleryConfig = {
    modules: [Autoplay, FreeMode],
    loop: strip.length > 3,
    speed: 900,
    grabCursor: true,
    freeMode: { enabled: true, momentum: true, sticky: false },
    autoplay: { delay: 3400, disableOnInteraction: false, pauseOnMouseEnter: true },
    slidesPerView: 'auto',
    spaceBetween: 18,
    breakpoints: {
      640: { spaceBetween: 22 },
      1024: { spaceBetween: 24 },
    },
  }

  return (
    <section
      id={id}
      className="scroll-mt-24 px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      aria-labelledby={`${id}-title`}
    >
      <div className="mx-auto max-w-5xl text-center mb-6 sm:mb-8">
        <div className="section-heading-accent" aria-hidden="true" />
        {badge && (
          <span className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-1.5 text-xs font-bold text-pink-deep shadow-sm sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-deep" aria-hidden />
            {badge}
          </span>
        )}
        <h2 id={`${id}-title`} className="text-xl font-extrabold text-foreground sm:text-2xl lg:text-[1.75rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-lg border border-border bg-card px-3 py-5 shadow-sm sm:px-5 sm:py-7">
        <div className="hero-gallery-swiper relative z-[1] py-2">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card to-transparent sm:w-14" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-card to-transparent sm:w-14" aria-hidden />

          <Swiper ref={swiperRef} {...galleryConfig} className="!overflow-visible !px-2 !pb-2">
            {strip.map((item, index) => (
              <SwiperSlide key={item.id} className="!w-auto py-3">
                <HeroGalleryCard
                  item={item}
                  index={index}
                  onVideoPlay={item.type === 'video' ? handleVideoPlay : undefined}
                  onVideoPause={item.type === 'video' ? handleVideoPause : undefined}
                  onVideoEnded={item.type === 'video' ? handleVideoEnded : undefined}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <p className="relative z-[1] mt-2 text-center text-[11px] text-muted-foreground">
          {strip.length} اسلاید · اسکرول یا لمس برای مرور
        </p>
      </div>
    </section>
  )
}
