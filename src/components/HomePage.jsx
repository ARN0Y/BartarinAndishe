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
import { ThemeToggle } from './ui/theme-toggle'

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

export default function HomePage({ sessionData, announcements = [], cms = {} }) {
  const pathname = usePathname()

  const extraNavItems = [
    cms.parentResources?.length ? { id: 'parent-resources', label: 'آنچه والدین باید بدانند', href: '/#parent-resources', section: true, iconName: 'BookOpenCheck' } : null,
    cms.extraSkills?.length ? { id: 'extra-skills', label: 'مهارت‌های فوق‌برنامه', href: '/#extra-skills', section: true, iconName: 'Sparkles' } : null,
    cms.memoryAlbums?.length ? { id: 'memories', label: 'آلبوم خاطرات سالانه', href: '/#memories', section: true, iconName: 'Images' } : null,
  ].filter(Boolean)

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
        <SiteHeader sessionData={sessionData} />

        <div className="relative z-10 flex flex-1">
          <Sidebar sessionData={sessionData} hasAnnouncements={announcements.length > 0} extraNavItems={extraNavItems} />

          <main className="min-w-0 flex-1">
            <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
              <HeroSlider />
            </section>

            <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
              <HomeSections cms={cms} />
            </div>
          </main>
        </div>

        <SiteFooter />

        {/* Theme toggle on homepage — fixed bottom-left */}
        <div className="fixed bottom-4 left-4 z-40">
          <ThemeToggle className="shadow-lg" />
        </div>

        <CommentWidget />
      </div>
    </MusicProvider>
  )
}
