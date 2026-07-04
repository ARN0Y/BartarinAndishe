'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, Sparkles, Star, Palette, Brain,
  PartyPopper, ClipboardList, FileEdit, BookOpenCheck, Images,
} from 'lucide-react'

const ICON_MAP = {
  GraduationCap, Sparkles, Star, Palette, Brain,
  PartyPopper, ClipboardList, FileEdit, BookOpenCheck, Images,
}

export default function NavLink({ item, onClick, activeId, index = 0 }) {
  const pathname = usePathname()
  const router = useRouter()
  const isSection = item.section
  const href = item.href

  // لینک‌های لنگری (#) بر اساس اسکرول فعال می‌شوند؛ لینک‌های صفحه‌ای بر اساس مسیر
  const isActive = isSection ? activeId === item.id : pathname === href

  const handleClick = (e) => {
    onClick?.(e)
    if (!isSection || !href.startsWith('/#')) return
    const sectionId = href.replace('/#', '')
    if (pathname === '/') {
      e.preventDefault()
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${sectionId}`)
      }
      return
    }
    e.preventDefault()
    router.push(`/#${sectionId}`)
  }

  const IconComp = item.iconName ? ICON_MAP[item.iconName] : null

  return (
    <a
      href={href}
      onClick={handleClick}
      style={{ animationDelay: `${0.08 + index * 0.045}s` }}
      className={[
        'sidebar-nav-item group relative flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-right text-[13px] font-medium transition-all duration-200',
        isActive
          ? 'is-active bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      {IconComp && (
        <IconComp
          className={[
            'h-4 w-4 shrink-0 transition-colors',
            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
          ].join(' ')}
          strokeWidth={1.8}
        />
      )}
      <span className="min-w-0 flex-1 text-right">{item.label}</span>
    </a>
  )
}

export function useSidebarActiveId() {
  const pathname = usePathname()
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    function sync() {
      if (pathname !== '/') {
        setActiveId(pathname === '/pre-register' ? 'pre-register' : '')
        return
      }
      const hash = window.location.hash.replace('#', '')
      setActiveId(hash || '')
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [pathname])

  return activeId
}
