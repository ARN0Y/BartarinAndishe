'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Home, LogOut, Menu, X, Lock, PanelRightClose, PanelRightOpen,
} from 'lucide-react'

function studentInitials(name) {
  return String(name || '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
}

async function doParentLogout(router) {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'parent' }),
  })
  router.push('/payment/parent/login')
  router.refresh()
}

function NavBadge({ count }) {
  if (!count) return null
  return (
    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold tabular-nums text-white">
      {count > 9 ? '9+' : count.toLocaleString('fa-IR')}
    </span>
  )
}

function SidebarBody({ student, completionScore, groups, activeTab, onNavigate, collapsed, onLogout }) {
  const router = useRouter()
  return (
    <div className="flex h-full flex-col" dir="rtl">
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', collapsed ? 'justify-center' : 'gap-3')}>
        <img src="/images/logo.svg" alt="لوگو" className="h-10 w-auto shrink-0 object-contain" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-medium leading-none text-muted-foreground">کودکستان</p>
            <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">برترین اندیشه</p>
          </div>
        )}
      </div>

      {/* Student card */}
      {!collapsed ? (
        <div className="mx-3 mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 shrink-0 rounded-xl ring-1 ring-border">
              <AvatarImage src={student.photo || undefined} alt={student.name} />
              <AvatarFallback className="rounded-xl bg-muted font-bold text-foreground">
                {studentInitials(student.name) || 'ن'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{student.name}</p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground ltr text-right">{student.nationalId}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-medium text-muted-foreground">آمادگی خدمات</span>
              <span className="font-bold text-foreground">{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-1.5" />
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-3">
          <Avatar className="h-10 w-10 rounded-xl ring-1 ring-border">
            <AvatarImage src={student.photo || undefined} alt={student.name} />
            <AvatarFallback className="rounded-xl bg-muted text-xs font-bold text-foreground">{studentInitials(student.name) || 'ن'}</AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-4 px-2">
          {groups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              {!collapsed && (
                <p className="px-3 pb-1.5 pt-1 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = activeTab === item.key
                const Icon = item.locked ? Lock : item.icon
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={item.locked}
                    onClick={() => onNavigate(item.key)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                      collapsed ? 'justify-center px-2' : 'justify-start text-right',
                      item.locked
                        ? 'cursor-not-allowed text-muted-foreground/50'
                        : active
                          ? 'bg-sidebar-active text-sidebar-active-foreground shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground',
                    )}
                  >
                    {active && !collapsed && !item.locked && (
                      <span className="absolute inset-y-1.5 right-0 w-1 rounded-full bg-sidebar-active-foreground/70" />
                    )}
                    <span className="relative shrink-0">
                      <Icon className={cn('h-[18px] w-[18px] transition-transform group-hover:scale-110', active && !item.locked ? 'text-sidebar-active-foreground' : 'text-muted-foreground')} strokeWidth={1.8} />
                      {collapsed && item.badgeCount ? (
                        <span className="absolute -left-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[8px] font-bold leading-none text-white">
                          {item.badgeCount > 9 ? '9+' : item.badgeCount}
                        </span>
                      ) : null}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 text-right">{item.label}</span>
                        {item.locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground/40" /> : <NavBadge count={item.badgeCount} />}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={() => { router.push('/'); router.refresh() }}
          title={collapsed ? 'بازگشت به سایت' : undefined}
          className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground', collapsed && 'justify-center px-2')}
        >
          <Home className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
          {!collapsed && 'بازگشت به سایت'}
        </button>
        <button
          type="button"
          onClick={() => { onLogout?.(); doParentLogout(router) }}
          title={collapsed ? 'خروج از حساب' : undefined}
          className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10', collapsed && 'justify-center px-2')}
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {!collapsed && 'خروج از حساب'}
        </button>
      </div>
    </div>
  )
}

export default function ParentShell({
  student, completionScore = 0, groups = [], activeTab, onNavigate,
  title, subtitle, statusChip, headerExtra, children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 76 : 264

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  function navigate(key) {
    onNavigate(key)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-svh bg-background" style={{ '--parent-sidebar-w': `${sidebarWidth}px` }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button type="button" className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="بستن" />
      )}

      {/* Sidebar */}
      <aside
        dir="rtl"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-[var(--parent-sidebar-w)] flex-col border-l border-sidebar-border bg-sidebar transition-[transform,width] duration-200',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        <button type="button" className="absolute left-2 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="بستن منو">
          <X className="h-4 w-4" />
        </button>
        <SidebarBody
          student={student}
          completionScore={completionScore}
          groups={groups}
          activeTab={activeTab}
          onNavigate={navigate}
          collapsed={collapsed}
        />
      </aside>

      {/* Main */}
      <div className="flex min-h-svh flex-col transition-[margin] duration-200 lg:mr-[var(--parent-sidebar-w)]">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button type="button" onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden" aria-label="منو">
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setCollapsed((c) => !c)} className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:flex" aria-label="جمع/باز کردن منو">
              {collapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg">{title}</h1>
              {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {statusChip}
            {headerExtra}
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
