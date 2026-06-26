import LoginForm from '@/components/portal/LoginForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { User } from 'lucide-react'

export const metadata = { title: 'ورود اولیا — کودکستان برترین اندیشه' }
export const dynamic = 'force-dynamic'

export default async function ParentLoginPage() {
  const session = await getSession('parent')
  if (session) redirect('/payment/parent/dashboard?tab=profile')

  return (
    <main className="relative min-h-svh overflow-hidden homepage-gradient">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gold-soft/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-between px-6 py-10 lg:px-12 lg:py-14">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/images/logo.svg" alt="لوگو" className="h-16 w-auto" />
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-pink-deep">کودکستان</p>
              <p className="text-lg font-extrabold text-foreground">برترین اندیشه</p>
            </div>
          </Link>

          <div className="my-10 max-w-md">
            <p className="text-sm font-semibold text-pink-deep">پنل اولیا</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              به خانواده بزرگ<br />
              <span className="text-pink-deep">برترین اندیشه خوش آمدید</span>
            </h1>
            <p className="mt-5 text-sm leading-8 text-muted-foreground">
              با وارد کردن کد ملی نوآموز به فاکتور، کاربرگ‌ها، پیام‌های مدیریت و فرم ثبت‌نام دسترسی دارید.
            </p>
            <ul className="mt-8 space-y-3">
              {['مشاهده فاکتور و اقساط', 'کاربرگ‌های آموزشی تعاملی', 'تکمیل اطلاعات ثبت‌نام'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-soft dark:bg-pink-deep/20 text-xs text-pink-deep">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">© کودکستان برترین اندیشه</p>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 py-10 lg:px-8">
          <div className="w-full max-w-md">
            <div className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl backdrop-blur-sm">
              <div className="border-b border-border bg-muted/30 px-8 py-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-sm ring-1 ring-border">
                  <User className="h-7 w-7 text-pink-deep" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">ورود اولیا</h2>
                <p className="mt-2 text-xs text-muted-foreground">کد ملی ۱۰ رقمی نوآموز را در کادرها وارد کنید</p>
              </div>
              <div className="px-8 py-8">
                <LoginForm type="parent" />
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link href="/" className="font-semibold text-pink-deep hover:underline">بازگشت به صفحه اصلی</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
