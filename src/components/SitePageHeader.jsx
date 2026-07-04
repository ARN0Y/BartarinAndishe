import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** هدر مشترک صفحات داخلی سایت (بازگشت + لوگو/برند) — هم‌تم با هدر اصلی */
export default function SitePageHeader({ header = null }) {
  const logoUrl = header?.logoUrl || '/images/logo.svg'
  const brandTop = header?.brandTop || 'کودکستان'
  const brandMain = header?.brandMain || 'برترین اندیشه'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-foreground transition hover:bg-accent/60 hover:text-pink-deep"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به سایت
        </Link>
        <Link href="/" className="group flex items-center gap-2">
          <div className="hidden text-left sm:block">
            <p className="text-[10px] font-semibold tracking-wide text-pink-deep">{brandTop}</p>
            <p className="text-xs font-extrabold leading-tight text-foreground sm:text-sm">{brandMain}</p>
          </div>
          <img
            src={logoUrl}
            alt="کودکستان برترین اندیشه"
            className="h-9 w-auto shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-11"
          />
        </Link>
      </div>
    </header>
  )
}
