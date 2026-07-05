'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpenCheck, Play, ChevronDown, FileText, Video } from 'lucide-react'

function isVideoItem(item) {
  return item.mediaType === 'video' && Boolean(item.mediaUrl)
}

function TopicCard({ item, open, onToggle }) {
  const video = isVideoItem(item)
  const hasImage = item.mediaUrl && !video

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors ${
        open ? 'border-pink-deep/30 ring-1 ring-pink-deep/10' : 'border-border hover:border-pink-deep/25'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted/40"
        aria-expanded={open}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            open ? 'bg-pink-deep text-white' : 'bg-pink/10 text-pink-deep'
          }`}
        >
          {video ? <Video className="h-4 w-4" strokeWidth={1.9} /> : <BookOpenCheck className="h-4 w-4" strokeWidth={1.9} />}
        </span>
        <span className="min-w-0 flex-1 text-sm font-bold text-foreground sm:text-[15px]">{item.title}</span>
        <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">
          {video ? 'ویدیو' : 'مقاله'}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180 text-pink-deep' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border px-4 pb-5 pt-4 sm:px-5">
              {video ? (
                <video
                  src={item.mediaUrl}
                  controls
                  playsInline
                  poster={item.poster || undefined}
                  className="aspect-video w-full rounded-xl bg-black shadow-sm"
                />
              ) : hasImage ? (
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="mx-auto block max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-sm ring-1 ring-border"
                />
              ) : null}

              {item.body ? (
                <p className="whitespace-pre-line text-justify text-sm leading-8 text-muted-foreground sm:text-[15px]">
                  {item.body}
                </p>
              ) : null}

              {item.linkUrl ? (
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-pink-deep/20 bg-pink-soft/40 px-4 py-2 text-xs font-bold text-pink-deep transition hover:bg-pink-soft/70"
                >
                  <FileText className="h-3.5 w-3.5" />
                  مطالعهٔ بیشتر
                </a>
              ) : null}

              {!item.body && !video && !hasImage && !item.linkUrl ? (
                <p className="text-sm text-muted-foreground">محتوایی برای این عنوان ثبت نشده است.</p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ParentResourcesPageClient({ items = [] }) {
  const [openId, setOpenId] = useState(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero intro */}
      <div className="mb-8 text-center sm:mb-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-deep/20 bg-pink-soft/60 px-5 py-2 text-xs font-bold text-pink-deep shadow-sm sm:text-sm dark:bg-pink-deep/15">
          <BookOpenCheck className="h-4 w-4" />
          فرزندپروری
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2.25rem]">
          آنچه والدین باید بدانند
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-muted-foreground sm:text-base">
          مجموعه‌ای از مقالات و ویدیوهای کوتاه و کاربردی برای همراهی بهتر با فرزندان. روی هر عنوان کلیک کنید تا متن یا ویدیوی آن باز شود.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <BookOpenCheck className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.3} />
          <p className="mt-4 text-sm font-bold text-foreground">هنوز مطلبی منتشر نشده است</p>
          <p className="mt-1 max-w-xs text-xs leading-6 text-muted-foreground">
            به‌زودی مقالات و ویدیوهای آموزشی برای اولیا در این بخش قرار می‌گیرد.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <TopicCard
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
