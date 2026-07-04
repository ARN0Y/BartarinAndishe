import SitePageHeader from '@/components/SitePageHeader'
import MemoriesPageClient from '@/components/MemoriesPageClient'
import { listAlbums } from '@/lib/services/memoryAlbumService'
import { getMergedSiteLayout } from '@/lib/services/siteLayoutService'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'آلبوم خاطرات سالانه — کودکستان برترین اندیشه',
  description: 'لحظه‌های به‌یادماندنی کودکستان برترین اندیشه در هر سال تحصیلی.',
}

async function load() {
  const [albums, layout] = await Promise.all([
    listAlbums({ onlyVisible: true }).catch(() => []),
    getMergedSiteLayout().catch(() => null),
  ])
  return { albums, header: layout?.header || null }
}

export default async function MemoriesPage() {
  const { albums, header } = await load()
  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,var(--color-pink-soft)_0%,transparent_45%)] bg-background">
      <SitePageHeader header={header} />
      <main>
        <MemoriesPageClient albums={albums} />
      </main>
    </div>
  )
}
