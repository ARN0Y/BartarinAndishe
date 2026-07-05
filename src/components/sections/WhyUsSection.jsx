import Link from 'next/link'
import SectionShell from './SectionShell'
import { Sparkles, ArrowLeft, Play } from 'lucide-react'
import { WHY_US_TOPICS } from '@/data/whyUsTopics'

function topicCover(topic) {
  const media = topic.media || []
  const img = media.find((m) => m.type !== 'video' && m.src)
  if (img) return { src: img.src, video: false }
  const vid = media.find((m) => m.type === 'video')
  if (vid?.poster) return { src: vid.poster, video: true }
  if (vid) return { src: null, video: true }
  return { src: null, video: false }
}

export default function WhyUsSection({ topics }) {
  const list = (topics && topics.length ? topics : WHY_US_TOPICS)

  return (
    <SectionShell
      id="why-us"
      badge="چرا ما؟"
      title="چرا کودکستان برترین اندیشه؟"
      subtitle="پنج دلیل مهم برای انتخاب ما — روی هر مورد کلیک کنید تا کامل ببینید"
      compact
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {list.map((topic) => {
          const cover = topicCover(topic)
          return (
            <Link
              key={topic.id}
              href={`/why/${topic.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-right shadow-sm transition hover:-translate-y-0.5 hover:border-pink-deep/30 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {cover.src ? (
                  <img src={cover.src} alt={topic.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-soft/60 to-muted">
                    <Sparkles className="h-8 w-8 text-pink-deep/50" />
                  </div>
                )}
                {cover.video ? (
                  <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-pink-deep shadow">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </span>
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="text-[13px] font-bold leading-6 text-foreground sm:text-sm">{topic.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-pink-deep">
                  مشاهده
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </SectionShell>
  )
}
