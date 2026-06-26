'use client'

import { useState } from 'react'
import SectionShell from './SectionShell'
import VideoLightbox from '@/components/VideoLightbox'
import { BookOpenCheck, Play, FileText } from 'lucide-react'

export default function ParentResourcesSection({ items = [] }) {
  const [activeVideo, setActiveVideo] = useState(null)
  if (!items.length) return null

  return (
    <>
      <SectionShell
        id="parent-resources"
        badge="فرزندپروری"
        title="آنچه والدین باید بدانند"
        subtitle="مقالات و ویدیوهای کوتاه برای همراهی بهتر با فرزندان"
        compact
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const isVideo = item.mediaType === 'video' && item.mediaUrl
            const Tag = isVideo ? 'button' : 'article'
            return (
              <Tag
                key={item.id}
                type={isVideo ? 'button' : undefined}
                onClick={isVideo ? () => setActiveVideo({ src: item.mediaUrl, title: item.title }) : undefined}
                className={`flex w-full gap-4 rounded-xl border border-border bg-card p-4 text-right shadow-sm transition hover:shadow-md ${
                  isVideo ? 'cursor-pointer hover:border-primary/30' : ''
                }`}
              >
                {item.mediaUrl && !isVideo ? (
                  <span className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                    <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" draggable={false} />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted" aria-hidden>
                    {isVideo ? <Play className="h-6 w-6 text-pink-deep" strokeWidth={1.5} /> : <BookOpenCheck className="h-6 w-6 text-pink-deep" strokeWidth={1.5} />}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  {item.body ? <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{item.body}</p> : null}
                  {isVideo ? (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-pink-deep">
                      <Play className="h-3 w-3 fill-current" /> مشاهده ویدیو
                    </p>
                  ) : item.linkUrl ? (
                    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-pink-deep">
                      <FileText className="h-3 w-3" /> مطالعهٔ بیشتر
                    </a>
                  ) : null}
                </div>
              </Tag>
            )
          })}
        </div>
      </SectionShell>

      <VideoLightbox open={Boolean(activeVideo)} src={activeVideo?.src} title={activeVideo?.title} onClose={() => setActiveVideo(null)} />
    </>
  )
}
