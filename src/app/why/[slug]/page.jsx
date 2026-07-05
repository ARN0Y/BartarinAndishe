import { notFound } from 'next/navigation'
import SitePageHeader from '@/components/SitePageHeader'
import WhyUsTopicPageClient from '@/components/WhyUsTopicPageClient'
import { getWhyUsTopicBySlug } from '@/lib/services/whyUsService'
import { getMergedSiteLayout } from '@/lib/services/siteLayoutService'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const topic = await getWhyUsTopicBySlug(slug).catch(() => null)
  return {
    title: topic ? `${topic.title} — کودکستان برترین اندیشه` : 'کودکستان برترین اندیشه',
  }
}

export default async function WhyUsTopicPage({ params }) {
  const { slug } = await params
  const [topic, layout] = await Promise.all([
    getWhyUsTopicBySlug(slug).catch(() => null),
    getMergedSiteLayout().catch(() => null),
  ])
  if (!topic) notFound()

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,var(--color-pink-soft)_0%,transparent_45%)] bg-background">
      <SitePageHeader header={layout?.header || null} />
      <main>
        <WhyUsTopicPageClient topic={topic} />
      </main>
    </div>
  )
}
