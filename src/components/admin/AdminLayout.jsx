'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Wallet,
  FileText,
  BookOpen,
  Mail,
  Megaphone,
  MessageSquare,
  Home,
  GraduationCap,
  LayoutPanelTop,
  LogOut,
  Menu,
  X,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'

const YEAR_AWARE = ['preReg', 'confirmed', 'classes', 'finance', 'contract']

const NAV_GROUPS = [
  {
    label: 'نمای کلی',
    items: [
      { key: 'overview', icon: LayoutDashboard, label: 'داشبورد' },
    ],
  },
  {
    label: 'ثبت‌نام و نوآموزان',
    items: [
      { key: 'preReg', icon: ClipboardList, label: 'پیش ثبت‌نام' },
      { key: 'confirmed', icon: CheckCircle2, label: 'ثبت‌نام‌های قطعی' },
      { key: 'classes', icon: GraduationCap, label: 'کلاس‌بندی' },
    ],
  },
  {
    label: 'مالی و قرارداد',
    items: [
      { key: 'finance', icon: Wallet, label: 'مدیریت مالی' },
      { key: 'contract', icon: FileText, label: 'قرارداد شهریه' },
    ],
  },
  {
    label: 'محتوا و ارتباط',
    items: [
      { key: 'siteContent', icon: LayoutPanelTop, label: 'محتوای سایت' },
      { key: 'worksheets', icon: BookOpen, label: 'کاربرگ‌ها' },
      { key: 'messages', icon: Mail, label: 'پیام‌رسانی' },
      { key: 'announcements', icon: Megaphone, label: 'اعلان‌ها' },
      { key: 'comments', icon: MessageSquare, label: 'نظرات' },
    ],
  },
]

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items)

async function doLogout(router, redirectTo = '/admin/login') {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' }),
  })
  router.push(redirectTo)
  router.refresh()
}

function navHref(key, academicYear) {
  return YEAR_AWARE.includes(key)
    ? `/admin/dashboard?tab=${key}&year=${encodeURIComponent(academicYear)}`
    : `/admin/dashboard?tab=${key}`
}

const BADGE_CONFIG = {
  preReg: { field: 'preRegPending', tone: 'preReg' },
  confirmed: { field: 'newCompletedProfiles', tone: 'confirmed' },
}

const BADGE_TONE_CLASS = {
  preReg: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
  confirmed: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
}

function formatBadgeCount(count) {
  const value = Number(count) || 0
  if (value <= 0) return null
  if (value > 99) return '99+'
  return value.toLocaleString('fa-IR')
}

function NavMenuBadge({ count, tone, collapsed }) {
  const label = formatBadgeCount(count)
  if (!label) return null

  if (collapsed) {
    return (
      <span
        className={cn(
          'absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none',
          BADGE_TONE_CLASS[tone],
        )}
      >
        {count > 9 ? '9+' : label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
        BADGE_TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  )
}

function SidebarContent({ activeTab, academicYear, onNavigate, onLogout, collapsed, badges = {} }) {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col" dir="rtl">
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'gap-3',
      )}>
        <img
          src="/images/logo.svg"
          alt="لوگو"
          className="h-10 w-auto shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-medium leading-none text-muted-foreground">کودکستان</p>
            <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">برترین اندیشه</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">پنل مدیریت</p>
            <p className="mt-0.5 text-xs font-bold text-foreground">مدیر سیستم</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="sidebar-nav flex-1 py-3">
        <nav className="space-y-4 px-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-0.5">
              {!collapsed && (
                <p className="px-3 pb-1.5 pt-1 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = activeTab === item.key
                const Icon = item.icon
                const badgeCfg = BADGE_CONFIG[item.key]
                const badgeCount = badgeCfg ? badges[badgeCfg.field] : 0
                return (
                  <Link
                    key={item.key}
                    href={navHref(item.key, academicYear)}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                      collapsed ? 'justify-center px-2' : 'justify-start text-right',
                      active
                        ? 'bg-sidebar-active text-sidebar-active-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground',
                    )}
                  >
                    {active && !collapsed && (
                      <span className="absolute inset-y-1.5 right-0 w-1 rounded-full bg-sidebar-active-foreground/70" />
                    )}
                    <span className={cn('relative shrink-0', collapsed && badgeCount > 0 && 'mt-1 mr-1')}>
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] transition-transform group-hover:scale-110',
                          active ? 'text-sidebar-active-foreground' : 'text-muted-foreground',
                        )}
                        strokeWidth={1.8}
                      />
                      {collapsed && badgeCfg ? (
                        <NavMenuBadge count={badgeCount} tone={badgeCfg.tone} collapsed />
                      ) : null}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 text-right">{item.label}</span>
                        {badgeCfg ? (
                          <NavMenuBadge count={badgeCount} tone={badgeCfg.tone} collapsed={false} />
                        ) : null}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer actions */}
      <div className="space-y-0.5 border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={() => { onLogout(); router.push('/'); router.refresh() }}
          title={collapsed ? 'بازگشت به سایت' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground',
            collapsed && 'justify-center px-2',
          )}
        >
          <Home className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
          {!collapsed && 'بازگشت به سایت'}
        </button>
        <button
          type="button"
          onClick={() => { onLogout(); doLogout(router) }}
          title={collapsed ? 'خروج از حساب' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {!collapsed && 'خروج از حساب'}
        </button>
      </div>
    </div>
  )
}

function AdminLayoutInner({ children }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [badges, setBadges] = useState({ preRegPending: 0, newCompletedProfiles: 0 })
  const activeTab = searchParams?.get('tab') || 'overview'
  const academicYear = searchParams?.get('year') || '1405-1406'
  const activeLabel = ALL_NAV.find((n) => n.key === activeTab)?.label || 'داشبورد'
  const sidebarWidth = collapsed ? 76 : 264

  const loadBadges = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/nav-badges?year=${encodeURIComponent(academicYear)}`)
      if (!res.ok) return
      const json = await res.json()
      setBadges({
        preRegPending: json.preRegPending || 0,
        newCompletedProfiles: json.newCompletedProfiles || 0,
      })
    } catch {
      /* ignore */
    }
  }, [academicYear])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    loadBadges()
  }, [loadBadges])

  useEffect(() => {
    const timer = setInterval(loadBadges, 30000)
    return () => clearInterval(timer)
  }, [loadBadges])

  useEffect(() => {
    const onFocus = () => loadBadges()
    const onRefresh = () => loadBadges()
    window.addEventListener('focus', onFocus)
    window.addEventListener('admin-nav-badges-refresh', onRefresh)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('admin-nav-badges-refresh', onRefresh)
    }
  }, [loadBadges])

  useEffect(() => {
    if (activeTab !== 'confirmed') return

    fetch('/api/admin/nav-badges', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab: 'confirmed', academicYear }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return
        setBadges({
          preRegPending: json.preRegPending || 0,
          newCompletedProfiles: json.newCompletedProfiles || 0,
        })
      })
      .catch(() => {})
  }, [activeTab, academicYear])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div
      className="admin-shell min-h-svh bg-background"
      style={{ '--sidebar-w': `${sidebarWidth}px` }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-label="بستن"
        />
      )}

      {/* Sidebar */}
      <aside
        dir="rtl"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-[var(--sidebar-w)] flex-col border-l border-sidebar-border bg-sidebar transition-[transform,width] duration-200',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        <button
          type="button"
          className="absolute left-2 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
          onClick={closeSidebar}
          aria-label="بستن منو"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent
          activeTab={activeTab}
          academicYear={academicYear}
          onNavigate={closeSidebar}
          onLogout={closeSidebar}
          collapsed={collapsed}
          badges={badges}
        />
      </aside>

      {/* Main area — offset beside the fixed sidebar on desktop via CSS var */}
      <div className="flex min-h-svh flex-col transition-[margin] duration-200 lg:mr-[var(--sidebar-w)]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
              aria-label="منو"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:flex"
              aria-label="جمع/باز کردن سایدبار"
            >
              {collapsed ? <PanelRightOpen className="h-[18px] w-[18px]" /> : <PanelRightClose className="h-[18px] w-[18px]" />}
            </button>

            <Separator orientation="vertical" className="hidden h-6 lg:block" />

            <div>
              <p className="text-[10px] font-medium leading-none text-muted-foreground">پنل مدیریت</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">{activeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => doLogout(router)}
              className="hidden lg:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    }>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  )
}
