import SitePageHeader from '@/components/SitePageHeader'
import ParentResourcesPageClient from '@/components/ParentResourcesPageClient'
import { listContentBlocks } from '@/lib/services/contentService'
import { getMergedSiteLayout } from '@/lib/services/siteLayoutService'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'آنچه والدین باید بدانند — کودکستان برترین اندیشه',
  description: 'مقالات و ویدیوهای کوتاه و کاربردی برای همراهی بهتر اولیا با فرزندان.',
}

async function load() {
  const [items, layout] = await Promise.all([
    listContentBlocks('parentResource', { onlyVisible: true }).catch(() => []),
    getMergedSiteLayout().catch(() => null),
  ])
  return { items, header: layout?.header || null }
}

export default async function ParentResourcesPage() {
  const { items, header } = await load()
  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,var(--color-pink-soft)_0%,transparent_45%)] bg-background">
      <SitePageHeader header={header} />
      <main>
        <ParentResourcesPageClient items={items} />
      </main>
    </div>
  )
}
