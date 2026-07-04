'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { navItems as navItemsDefault } from '../data/navItems'
import NavLink, { useSidebarActiveId } from './NavLink'
import ParentLoginButton from './ParentLoginButton'
import { Menu, X, User, LogIn } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

function SidebarContent({ onNavigate, sessionData, navItems = [], header = null }) {
  const activeId = useSidebarActiveId()
  const allNavItems = navItems.length ? navItems : navItemsDefault
  const logoUrl = header?.logoUrl || '/images/logo.svg'
  const brandTop = header?.brandTop || 'کودکستان'
  const brandMain = header?.brandMain || 'برترین اندیشه'

  return (
    <div className="flex h-full flex-col bg-sidebar" dir="rtl">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-accent/50"
        >
          <img
            src={logoUrl}
            alt="لوگو"
            className="h-10 w-auto shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground leading-none">{brandTop}</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{brandMain}</p>
          </div>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <div className="px-3 space-y-0.5">
          <p className="px-3 pb-2 pt-1 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            بخش‌ها
          </p>
          {allNavItems.map((item, index) => (
            <NavLink key={item.id} item={item} index={index} onClick={onNavigate} activeId={activeId} />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3">
        {sessionData ? (
          <Link
            href={sessionData.dashUrl}
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <User className="h-4 w-4" strokeWidth={1.8} />
            {sessionData.label}
          </Link>
        ) : (
          <ParentLoginButton
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-deep px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.8} />
            ورود اولیا
          </ParentLoginButton>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ sessionData, hasAnnouncements = false, navItems = [], header = null }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        className={[
          'fixed right-3 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/95 text-foreground shadow-md backdrop-blur-sm transition hover:bg-accent lg:hidden',
          hasAnnouncements ? 'top-[6.75rem]' : 'top-[4.5rem]',
        ].join(' ')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <button type="button" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={close} aria-label="بستن" />
      )}

      <aside
        dir="rtl"
        className={[
          'fixed top-0 right-0 z-40 h-full w-[260px] overflow-hidden border-l border-sidebar-border bg-sidebar shadow-2xl lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100svh-4rem)] lg:w-[248px] lg:translate-x-0 lg:shadow-none',
          open ? 'sidebar-mobile-in translate-x-0' : 'translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <SidebarContent onNavigate={close} sessionData={sessionData} navItems={navItems} header={header} />
      </aside>
    </>
  )
}
