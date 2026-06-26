'use client'

import { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { activitySlides, activityDetails } from '../data/activitySlides'
import GalleryModal from './GalleryModal'
import SliderImageFrame from './slider/SliderImageFrame'
import { ACCENT_KEYS, ACCENT_THEMES } from './slider/SliderDecorations'
import { Eye, Images } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'

const swiperConfig = {
  modules: [Autoplay, Pagination],
  loop: activitySlides.length > 3,
  speed: 700,
  grabCursor: true,
  autoplay: { delay: 3500, disableOnInteraction: false },
  slidesPerView: 1,
  spaceBetween: 24,
  centeredSlides: true,
  pagination: { clickable: true },
  breakpoints: {
    640:  { slidesPerView: 2, spaceBetween: 22, centeredSlides: false },
    1024: { slidesPerView: 3, spaceBetween: 26, centeredSlides: false },
  },
}

export default function ActivitySlider() {
  const [activeActivity, setActiveActivity] = useState(null)
  const swiperRef = useRef(null)

  function openModal(slideId) {
    const detail = activityDetails.find((a) => a.id === slideId)
    if (detail) {
      swiperRef.current?.swiper?.autoplay?.stop()
      setActiveActivity(detail)
    }
  }

  function handleClose() {
    setActiveActivity(null)
    swiperRef.current?.swiper?.autoplay?.start()
  }

  function handleFinished() {
    setActiveActivity(null)
    setTimeout(() => {
      swiperRef.current?.swiper?.slideNext()
      swiperRef.current?.swiper?.autoplay?.start()
    }, 400)
  }

  return (
    <>
      <section
        className="relative overflow-hidden border-t border-border bg-background px-4 py-14 sm:px-6 lg:px-8"
        aria-labelledby="activities-heading"
      >
        <div className="relative mx-auto max-w-6xl">
          <header className="mb-10 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-1.5 text-xs font-bold text-pink-deep shadow-sm">
              <Images className="h-3.5 w-3.5" strokeWidth={1.8} />
              فعالیت‌های آموزشی
            </span>
            <h2
              id="activities-heading"
              className="text-xl font-extrabold text-foreground sm:text-2xl"
            >
              فعالیت‌های آموزشی در کودکستان برترین اندیشه
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              یادگیری خلاق، بازی و کشف — برای رشد همه‌جانبه فرزند شما
            </p>
            <div className="section-heading-accent mt-4" />
          </header>

          <Swiper ref={swiperRef} {...swiperConfig} className="activity-swiper !pb-12">
            {activitySlides.map((slide, index) => {
              const detail = activityDetails.find((a) => a.id === slide.id)
              const imgCount = detail?.gallery?.length || 0
              const accent = ACCENT_KEYS[index % ACCENT_KEYS.length]
              const theme = ACCENT_THEMES[accent]

              return (
                <SwiperSlide key={slide.id}>
                  <button
                    type="button"
                    onClick={() => openModal(slide.id)}
                    className={[
                      'group flex w-full flex-col text-right transition-all duration-500 hover:-translate-y-2',
                      index % 2 === 0 ? 'animate-float' : 'animate-float-delayed',
                    ].join(' ')}
                    aria-label={slide.title}
                  >
                    <SliderImageFrame
                      src={slide.imageUrl}
                      alt={slide.title || `فعالیت آموزشی ${slide.id}`}
                      accent={accent}
                      aspectClass="aspect-[4/3]"
                      showWave={false}
                    >
                      {imgCount > 1 && (
                        <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-md bg-background/88 px-2.5 py-1 text-[11px] font-bold text-foreground shadow backdrop-blur-sm ring-1 ring-border">
                          <svg className="h-3 w-3 text-pink-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {imgCount}
                        </span>
                      )}

                      <span className="absolute bottom-3 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-lg bg-background/90 text-pink-deep opacity-0 shadow-lg ring-1 ring-border backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100">
                        <Eye className="h-5 w-5" strokeWidth={2} />
                      </span>
                    </SliderImageFrame>

                    <div className="relative -mt-1 overflow-hidden rounded-b-lg rounded-t-none border border-t-0 border-border bg-card px-4 py-3.5 shadow-sm backdrop-blur-sm">
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${theme.frame}`} aria-hidden />

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="min-w-0 flex-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${theme.label}`}>
                            فعالیت {index + 1}
                          </span>
                          <p className="mt-1 truncate text-sm font-extrabold text-foreground transition-colors group-hover:text-pink-deep">
                            {slide.title}
                          </p>
                          {imgCount > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{imgCount} تصویر</p>
                          )}
                        </div>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-pink-deep transition-all duration-300 group-hover:bg-pink-deep group-hover:text-white">
                          <Eye className="h-4 w-4" strokeWidth={2} />
                        </span>
                      </div>
                    </div>
                  </button>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </section>

      {activeActivity && (
        <GalleryModal
          title={activeActivity.title}
          subtitle="فعالیت آموزشی"
          description={activeActivity.description}
          gallery={activeActivity.gallery}
          onClose={handleClose}
          onFinished={handleFinished}
        />
      )}
    </>
  )
}
