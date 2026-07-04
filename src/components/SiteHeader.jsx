'use client'

import Link from 'next/link'
import ContactButton from './ContactButton'
import ParentLoginButton from './ParentLoginButton'
import { MusicToggleButton } from './MusicProvider'
import { Button } from './ui/button'

export default function SiteHeader({ sessionData, header = null }) {
  const isLoggedIn = !!sessionData
  const logoUrl = header?.logoUrl || '/images/logo.svg'
  const brandTop = header?.brandTop || 'کودکستان'
  const brandMain = header?.brandMain || 'برترین اندیشه'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md shadow-sm">
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-start gap-1.5 sm:gap-2">
          {!isLoggedIn && (
            <Link href="/pre-register">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                پیش ثبت‌نام
              </Button>
            </Link>
          )}
          {sessionData?.type === 'parent' ? (
            <Link href={sessionData.dashUrl}>
              <Button size="sm" className="bg-pink-deep text-white hover:bg-rose text-[11px] sm:text-xs">
                <span className="sm:hidden">پنل</span>
                <span className="hidden sm:inline">{sessionData.label}</span>
              </Button>
            </Link>
          ) : sessionData?.type === 'admin' ? (
            <Link href={sessionData.dashUrl}>
              <Button size="sm" className="text-[11px] sm:text-xs">
                <span className="sm:hidden">پنل</span>
                <span className="hidden sm:inline">{sessionData.label}</span>
              </Button>
            </Link>
          ) : (
            <ParentLoginButton className="inline-flex items-center rounded-lg bg-pink-deep px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-rose sm:px-3.5 sm:py-2 sm:text-xs">
              <span className="sm:hidden">ورود</span>
              <span className="hidden sm:inline">ورود اولیا</span>
            </ParentLoginButton>
          )}
        </div>

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-xl px-1 py-0.5 transition hover:bg-accent/50"
        >
          <img
            src={logoUrl}
            alt="کودکستان برترین اندیشه"
            className="h-10 w-auto shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-12"
          />
          <div className="hidden min-w-0 text-center sm:block">
            <p className="text-[10px] font-semibold tracking-wide text-pink-deep">{brandTop}</p>
            <p className="text-xs font-extrabold leading-tight text-foreground sm:text-sm">{brandMain}</p>
          </div>
        </Link>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <MusicToggleButton />
          <ContactButton variant="header" />
        </div>
      </div>
    </header>
  )
}
