'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SectionShell from './SectionShell'
import VideoLightbox from '@/components/VideoLightbox'
import { whyUsPoints } from '../../data/siteContact'
import { GraduationCap, School, Play, Sparkles, BookOpen, Trophy } from 'lucide-react'

const ICON_MAP = { GraduationCap, School, Sparkles, BookOpen, Trophy }

export default function WhyUsSection() {
  const router = useRouter()
  const [activeVideo, setActiveVideo] = useState(null)

  return (
    <>
      <SectionShell
        id="why-us"
        badge="چرا ما؟"
        title="چرا کودکستان برترین اندیشه؟"
        subtitle="خلاصه‌ای از آنچه خانواده‌ها در انتخاب ما می‌بینند"
        compact
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {whyUsPoints.map((item) => {
            const hasLightboxVideo = Boolean(item.videoUrl)
            const hasVideoPage = Boolean(item.videoPageUrl)
            const isClickable = hasLightboxVideo || hasVideoPage
            const Tag = isClickable ? 'button' : 'article'
            const IconComp = item.iconName ? ICON_MAP[item.iconName] : null

            function handleClick() {
              if (hasVideoPage) {
                router.push(item.videoPageUrl)
                return
              }
              if (hasLightboxVideo) {
                setActiveVideo({ src: item.videoUrl, title: item.title })
              }
            }

            return (
              <Tag
                key={item.title}
                type={isClickable ? 'button' : undefined}
                onClick={isClickable ? handleClick : undefined}
                className={`flex w-full gap-4 rounded-xl border border-border bg-card p-4 text-right shadow-sm transition hover:shadow-md ${
                  isClickable ? 'cursor-pointer hover:border-primary/30' : ''
                }`}
              >
                {item.imageUrl ? (
                  <span className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </span>
                ) : IconComp ? (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted" aria-hidden>
                    <IconComp className="h-6 w-6 text-pink-deep" strokeWidth={1.5} />
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  {isClickable && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-pink-deep">
                      <Play className="h-3 w-3 fill-current" /> مشاهده ویدیو
                    </p>
                  )}
                </div>
              </Tag>
            )
          })}
        </div>
      </SectionShell>

      <VideoLightbox
        open={Boolean(activeVideo)}
        src={activeVideo?.src}
        title={activeVideo?.title}
        onClose={() => setActiveVideo(null)}
      />
    </>
  )
}
