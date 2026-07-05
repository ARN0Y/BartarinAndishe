'use client'

import { useState } from 'react'
import ImageLightbox from '@/components/ImageLightbox'
import { Sparkles } from 'lucide-react'

export default function WhyUsTopicPageClient({ topic }) {
  const [lightbox, setLightbox] = useState(null) // { images, index }
  const media = topic.media || []
  const images = media.filter((m) => m.type !== 'video' && m.src)
  const videos = media.filter((m) => m.type === 'video' && m.src)
  const imageSrcs = images.map((m) => m.src)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center sm:mb-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-deep/20 bg-pink-soft/60 px-5 py-2 text-xs font-bold text-pink-deep shadow-sm sm:text-sm dark:bg-pink-deep/15">
          <Sparkles className="h-4 w-4" />
          چرا برترین اندیشه؟
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2.25rem]">
          {topic.title}
        </h1>
      </div>

      {topic.body ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <p className="whitespace-pre-line text-justify text-sm leading-8 text-muted-foreground sm:text-[15px]">
            {topic.body}
          </p>
        </div>
      ) : null}

      {videos.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {videos.map((v) => (
            <video key={v.id} src={v.src} controls playsInline poster={v.poster || undefined} className="aspect-video w-full rounded-xl bg-black shadow-sm" />
          ))}
        </div>
      ) : null}

      {images.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setLightbox({ images: imageSrcs, index: i })}
              className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border transition hover:ring-2 hover:ring-pink/50"
            >
              <img src={m.src} alt={m.caption || topic.title} loading={i < 6 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" draggable={false} />
              {m.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-2.5 py-2 text-right text-[11px] font-semibold leading-snug text-white">
                  {m.caption}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {!topic.body && !videos.length && !images.length ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          محتوایی برای این بخش ثبت نشده است.
        </p>
      ) : null}

      {lightbox ? (
        <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      ) : null}
    </div>
  )
}
