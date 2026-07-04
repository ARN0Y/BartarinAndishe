'use client'

import { useRef, useCallback, useState } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode } from 'swiper/modules'
import { heroGalleryStrip } from '../data/heroSlides'
import { siteContact } from '../data/siteContact'
import HeroGalleryCard from './slider/HeroGalleryCard'
import ImageLightbox from './ImageLightbox'
import { ArrowLeft, Phone, Sparkles } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/free-mode'

export default function HeroSlider({ strip = null }) {
  const swiperRef = useRef(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const items = strip && strip.length ? strip : heroGalleryStrip

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

  const handleCardClick = useCallback((item) => {
    if (item.type !== 'video') {
      setLightboxSrc(item.src)
    }
  }, [])

  const galleryConfig = {
    modules: [Autoplay, FreeMode],
    loop: items.length > 3,
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
      className="relative w-full overflow-hidden rounded-lg border border-border bg-card px-4 py-6 shadow-sm sm:px-5 sm:py-7 lg:px-6"
      aria-label="گالری تصاویر و ویدیو کودکستان"
    >
      <div className="relative z-[1] mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-5 text-right sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-deep/20 bg-pink-soft/70 px-4 py-1.5 text-xs font-bold text-pink-deep dark:bg-pink-deep/15">
              <Sparkles className="h-3.5 w-3.5" />
              {siteContact.tagline}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.5rem]">
              {siteContact.name}
            </h2>
            <p className="mt-2.5 text-sm leading-7 text-muted-foreground sm:text-base">
              محیطی امن، علمی و شاد برای رشد و شکوفایی کودک شما — همراه با پرورش هوش چندگانه، مربیان متخصص و حیاطی بزرگ و پرنشاط.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <Link
              href="/pre-register"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-pink-deep px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose"
            >
              پیش‌ثبت‌نام آنلاین
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${siteContact.schoolPhone}`}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-pink-deep/40 hover:text-pink-deep"
            >
              <Phone className="h-4 w-4" />
              تماس با ما
            </a>
          </div>
        </header>

        <div className="hero-gallery-swiper relative py-2">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card to-transparent sm:w-14" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-card to-transparent sm:w-14" aria-hidden />

          <Swiper ref={swiperRef} {...galleryConfig} className="!overflow-visible !px-2 !pb-2">
            {items.map((item, index) => (
              <SwiperSlide key={item.id} className="!w-auto py-3">
                <HeroGalleryCard
                  item={item}
                  index={index}
                  onVideoPlay={item.type === 'video' ? handleVideoPlay : undefined}
                  onVideoPause={item.type === 'video' ? handleVideoPause : undefined}
                  onVideoEnded={item.type === 'video' ? handleVideoEnded : undefined}
                  onImageClick={() => handleCardClick(item)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-[11px] font-medium text-muted-foreground">
            {siteContact.gradeLevels}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {items.length.toLocaleString('fa-IR')} قاب منتخب
          </span>
        </div>
      </div>

      {lightboxSrc && (
        <ImageLightbox
          images={items.filter(i => i.type !== 'video').map(i => i.src)}
          initialIndex={Math.max(0, items.filter(i => i.type !== 'video').map(i => i.src).indexOf(lightboxSrc))}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </section>
  )
}
