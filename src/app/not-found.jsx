import Link from 'next/link'

export const metadata = { title: 'صفحه یافت نشد — کودکستان برترین اندیشه' }

export default function NotFound() {
  return (
    <div className="homepage-gradient flex min-h-svh flex-col items-center justify-center px-6 text-center" dir="rtl">
      <div className="relative">
        <p className="select-none text-[7rem] font-extrabold leading-none text-pink-deep/20 sm:text-[10rem]">۴۰۴</p>
        <img
          src="/images/logo.svg"
          alt=""
          aria-hidden
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-90 sm:h-20 sm:w-20"
        />
      </div>
      <h1 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">این صفحه پیدا نشد</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        ممکن است نشانی را اشتباه وارد کرده باشید یا این صفحه جابه‌جا شده باشد. نگران نباشید؛ به صفحه اصلی برگردید.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-pink-deep px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose"
        >
          بازگشت به صفحه اصلی
        </Link>
        <Link
          href="/pre-register"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-accent"
        >
          پیش ثبت‌نام
        </Link>
      </div>
    </div>
  )
}
