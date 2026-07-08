'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SiteHeader from './SiteHeader'
import Sidebar from './Sidebar'
import HeroSlider from './HeroSlider'
import HomeSections from './sections/HomeSections'
import SiteFooter from './SiteFooter'
import CommentWidget from './CommentWidget'
import AnnouncementBanner from './AnnouncementBanner'
import KidDecorations from './KidDecorations'
import { MusicProvider } from './MusicProvider'
import { navItems as navItemsDefault } from '../data/navItems'

function scrollToHash(hash) {
  if (!hash) return
  const id = hash.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

export default function HomePage({ sessionData, announcements = [], cms = {}, siteLayout = null }) {
  const pathname = usePathname()

  const navLabels = siteLayout?.nav || {}
  const header = siteLayout?.header || null
  const galleries = siteLayout?.galleries || null
  const heroStrip = siteLayout?.heroStrip || null

  // ساخت فهرست ناوبری با ترتیب ثابت؛ آیتم‌های CMS فقط با وجود محتوا، و برچسب‌ها از پنل
  const navItems = navItemsDefault
    .filter((item) => !item.cms || (cms[item.cms]?.length > 0))
    .map((item) => ({ ...item, label: navLabels[item.id] || item.label }))

  useEffect(() => {
    if (pathname !== '/') return
    const handleHash = () => scrollToHash(window.location.hash)
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [pathname])

  return (
    <MusicProvider src="/audio/background.mp3">
      <div className="homepage-gradient relative flex min-h-svh flex-col">
        <KidDecorations />
        <AnnouncementBanner initialAnnouncements={announcements} />
        <SiteHeader sessionData={sessionData} header={header} />

        <div className="relative z-10 flex flex-1">
          <Sidebar sessionData={sessionData} hasAnnouncements={announcements.length > 0} navItems={navItems} header={header} />

          <main className="min-w-0 flex-1">
            <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
              <HeroSlider strip={heroStrip} />
            </section>

            <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
              <HomeSections cms={cms} galleries={galleries} />
            </div>
          </main>
        </div>

        <SiteFooter />

        <CommentWidget />
      </div>
    </MusicProvider>
  )
}
