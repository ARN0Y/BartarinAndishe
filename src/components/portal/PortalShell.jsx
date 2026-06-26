'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function PortalShell({ title, subtitle, children, actions }) {
  return (
    <main className="min-h-svh bg-muted/30 px-4 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="no-print mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-pink-deep">کودکستان برترین اندیشه</p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            {actions}
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-3.5 w-3.5" />
                بازگشت به سایت
              </Button>
            </Link>
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}
