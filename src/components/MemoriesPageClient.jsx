'use client'

import { useState } from 'react'
import ImageLightbox from '@/components/ImageLightbox'
import { Images, Camera, CalendarDays } from 'lucide-react'

export default function MemoriesPageClient({ albums = [] }) {
  const [openAlbumId, setOpenAlbumId] = useState(albums[0]?.id ?? null)
  const [lightbox, setLightbox] = useState(null) // { images, index }

  const activeAlbum = albums.find((a) => a.id === openAlbumId) || albums[0] || null
  const photos = activeAlbum?.photos || []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero intro */}
      <div className="mb-8 text-center sm:mb-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-deep/20 bg-pink-soft/60 px-5 py-2 text-xs font-bold text-pink-deep shadow-sm sm:text-sm dark:bg-pink-deep/15">
          <Images className="h-4 w-4" />
          آلبوم خاطرات
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2.25rem]">
          آلبوم خاطرات سالانه
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-muted-foreground sm:text-base">
          نگاهی به لحظه‌های به‌یادماندنی کودکستان در هر سال. آلبوم موردنظر را انتخاب کنید و روی هر عکس برای دیدن بزرگ‌تر کلیک کنید.
        </p>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Camera className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.3} />
          <p className="mt-4 text-sm font-bold text-foreground">هنوز آلبومی منتشر نشده است</p>
          <p className="mt-1 max-w-xs text-xs leading-6 text-muted-foreground">
            به‌زودی عکس‌های خاطره‌انگیز هر سال تحصیلی در این بخش قرار می‌گیرد.
          </p>
        </div>
      ) : (
        <>
          {/* Album selector */}
          <div className="mb-7 flex flex-wrap justify-center gap-2.5">
            {albums.map((album) => {
              const active = activeAlbum?.id === album.id
              return (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => setOpenAlbumId(album.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold shadow-sm transition ${
                    active
                      ? 'bg-gradient-to-l from-pink-deep to-rose text-white shadow-pink-deep/20'
                      : 'border border-border bg-card text-foreground hover:border-pink-deep/30 hover:text-pink-deep'
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {album.title}
                  <span className="text-xs opacity-80">({album.year})</span>
                </button>
              )
            })}
          </div>

          {/* Active album header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-foreground">{activeAlbum?.title}</p>
              <p className="text-xs text-muted-foreground">سال {activeAlbum?.year}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Images className="h-3.5 w-3.5" />
              {photos.length.toLocaleString('fa-IR')} عکس
            </span>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center">
              <Camera className="mx-auto h-9 w-9 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">هنوز عکسی برای این آلبوم ثبت نشده است.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightbox({ images: photos.map((p) => p.imageUrl), index: i })}
                  className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border transition hover:ring-2 hover:ring-pink/50"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || ''}
                    loading={i < 8 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    draggable={false}
                  />
                  {photo.caption ? (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-2.5 py-2 text-right text-[11px] font-semibold leading-snug text-white">
                      {photo.caption}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {lightbox ? (
        <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      ) : null}
    </div>
  )
}
