'use client'

import { useState } from 'react'
import SectionShell from './SectionShell'
import ImageLightbox from '@/components/ImageLightbox'
import { Images } from 'lucide-react'

export default function MemoryAlbumsSection({ albums = [] }) {
  const [lightbox, setLightbox] = useState(null) // { images, index }
  const [openAlbumId, setOpenAlbumId] = useState(albums[0]?.id ?? null)

  if (!albums.length) return null

  const activeAlbum = albums.find((a) => a.id === openAlbumId) || albums[0]
  const photos = activeAlbum?.photos || []

  return (
    <>
      <SectionShell
        id="memories"
        badge="آلبوم خاطرات"
        title="آلبوم خاطرات سالانه"
        subtitle="نگاهی به لحظه‌های به‌یادماندنی کودکستان در هر سال"
        compact
      >
        {/* انتخاب سال/آلبوم */}
        <div className="mb-5 flex flex-wrap gap-2">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setOpenAlbumId(album.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                activeAlbum.id === album.id
                  ? 'bg-gradient-to-l from-pink-deep to-rose text-white shadow'
                  : 'border border-border bg-card text-foreground hover:border-primary/30'
              }`}
            >
              {album.title} <span className="text-xs opacity-80">({album.year})</span>
            </button>
          ))}
        </div>

        {photos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            <Images className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            هنوز عکسی برای این آلبوم ثبت نشده است.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox({ images: photos.map((p) => p.imageUrl), index: i })}
                className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border transition hover:ring-2 hover:ring-pink/50"
              >
                <img src={photo.imageUrl} alt={photo.caption || ''} className="h-full w-full object-cover transition group-hover:scale-105" draggable={false} />
                {photo.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-right text-[11px] font-semibold text-white">
                    {photo.caption}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </SectionShell>

      {lightbox ? (
        <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  )
}
