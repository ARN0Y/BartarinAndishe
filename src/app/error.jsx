'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // در محیط واقعی می‌توان اینجا خطا را به سرویس مانیتورینگ ارسال کرد
    console.error(error)
  }, [error])

  return (
    <div className="homepage-gradient flex min-h-svh flex-col items-center justify-center px-6 text-center" dir="rtl">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" strokeWidth={1.8} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">خطایی رخ داد</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        متأسفیم؛ در نمایش این بخش مشکلی پیش آمد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی برگردید.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-pink-deep px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose"
        >
          <RefreshCw className="h-4 w-4" />
          تلاش مجدد
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-accent"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  )
}
