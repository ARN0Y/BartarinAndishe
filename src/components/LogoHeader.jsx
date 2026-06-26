import Link from 'next/link'

const LOGO_SRC = '/images/logo.svg'

export default function LogoHeader({ sessionData }) {
  return (
    // On desktop (lg+) the sidebar contains the logo/brand, so we hide this header
    <header className="fixed top-3 right-3 z-40 flex flex-col items-end gap-2 sm:top-5 sm:right-5 lg:hidden">
      {/* Logo card */}
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-3 py-2 shadow-lg shadow-navy/10 ring-1 ring-navy/8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        aria-label="صفحه اصلی کودکستان برترین اندیشه"
      >
        <img
          src={LOGO_SRC}
          alt="لوگو"
          className="h-10 w-auto object-contain drop-shadow-sm"
        />
        <div className="text-right">
          <p className="text-[9px] font-bold tracking-wide text-pink-deep">کودکستان</p>
          <p className="text-xs font-extrabold leading-tight text-foreground">برترین اندیشه</p>
        </div>
      </Link>

      {/* Auth buttons */}
      <div className="flex flex-col gap-1.5 w-full">
        {sessionData ? (
          <Link
            href={sessionData.dashUrl}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-l from-pink-deep to-rose px-3 py-2 text-[11px] font-extrabold text-white shadow-md transition hover:scale-[1.03] active:scale-[0.98]"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sessionData.label}
          </Link>
        ) : (
          <Link
            href="/payment/parent/login"
            className="w-full rounded-2xl bg-gradient-to-l from-pink-deep to-rose px-3 py-2 text-center text-[11px] font-extrabold text-white shadow-md transition hover:scale-[1.03] active:scale-[0.98]"
          >
            ورود اولیا
          </Link>
        )}
      </div>
    </header>
  )
}
