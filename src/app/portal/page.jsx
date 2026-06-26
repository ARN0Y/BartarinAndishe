import Link from 'next/link'

export const metadata = {
  title: 'ورود به سامانه شهریه و کاربرگ | برترین اندیشه',
}

export default function PortalPage() {
  return (
    <main className="min-h-svh px-4 py-10 sm:px-6">
      <div className="mx-auto mb-6 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-light transition hover:text-pink-deep"
        >
          ← بازگشت به صفحه اصلی
        </Link>
      </div>
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
        <div className="rounded-[2rem] bg-white/85 p-8 shadow-2xl shadow-navy/10 ring-2 ring-pink/20 sm:p-10">
          <p className="text-sm font-bold text-pink-deep">پورتال جامع کودکستان</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-relaxed text-navy sm:text-5xl">
            سامانه مالی و کاربرگ‌های الکترونیکی برترین اندیشه
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-navy-light">
            والدین می‌توانند با کد ملی نوآموز وارد شوند، پرداخت شهریه انجام دهند و
            کاربرگ‌های الکترونیکی را مشاهده کنند. مدیر سایت نیز به گزارش‌های مالی،
            خروجی اکسل و مدیریت کاربرگ‌ها دسترسی دارد.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/payment/parent/login"
              className="rounded-2xl bg-pink px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pink-deep"
            >
              ورود والدین
            </Link>
            <Link
              href="/payment/admin/login"
              className="rounded-2xl bg-navy px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-navy-dark"
            >
              ورود مدیر
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-navy to-navy-dark p-6 text-white shadow-2xl">
          <img
            src="/images/logo.svg"
            alt="لوگوی کودکستان برترین اندیشه"
            className="mx-auto h-28 w-auto rounded-3xl bg-white p-3"
          />
          <div className="mt-6 space-y-3 text-sm leading-7 text-pink-soft">
            <p>• پرداخت شهریه با زرین‌پال</p>
            <p>• گزارش مالی و خروجی اکسل</p>
            <p>• کاربرگ‌های PDF و تصویر برای روزهای تعطیلی</p>
            <p>• روت‌های محافظت‌شده برای مدیر و والدین</p>
          </div>
        </div>
      </section>
    </main>
  )
}
