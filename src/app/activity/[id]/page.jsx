import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActivityById } from '../../../data/activitySlides'

export function generateMetadata({ params }) {
  const activity = getActivityById(params.id)
  if (!activity) return { title: 'فعالیت یافت نشد' }
  return {
    title: `${activity.title} | کودکستان برترین اندیشه`,
    description: activity.description,
  }
}

export default function ActivityPage({ params }) {
  const activity = getActivityById(params.id)
  if (!activity) notFound()

  return (
    <main className="min-h-svh bg-gradient-to-b from-white to-pink-soft/30 px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-4xl">

        {/* بازگشت */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-pink/30 bg-white px-4 py-2 text-sm font-medium text-navy-light shadow-sm transition hover:border-pink-deep hover:text-pink-deep"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به صفحه اصلی
        </Link>

        {/* هدر صفحه */}
        <div className="relative mb-10 overflow-hidden rounded-3xl shadow-2xl shadow-navy/20">
          <img
            src={activity.gallery[0]?.src}
            alt={activity.title}
            className="aspect-[16/7] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <span className="mb-2 inline-block rounded-full bg-pink-deep/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              فعالیت آموزشی
            </span>
            <h1 className="text-2xl font-extrabold leading-snug text-white drop-shadow-lg sm:text-4xl">
              {activity.title}
            </h1>
          </div>
        </div>

        {/* توضیحات */}
        <div className="mb-10 rounded-2xl bg-white px-6 py-6 shadow-md shadow-navy/8 ring-1 ring-pink/20 sm:px-8">
          <p className="text-base leading-9 text-navy-light sm:text-lg">
            {activity.description}
          </p>
        </div>

        {/* گالری تصاویر */}
        {activity.gallery.length > 0 && (
          <section>
            <h2 className="mb-5 text-lg font-bold text-navy sm:text-xl">تصاویر</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activity.gallery.map((img, i) => (
                <div
                  key={i}
                  className="group overflow-hidden rounded-2xl shadow-lg shadow-navy/10 ring-1 ring-navy/10 transition-all duration-300 hover:shadow-xl hover:ring-pink-deep/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-pink-soft/30">
                    <img
                      src={img.src}
                      alt={img.caption || activity.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {img.caption && (
                    <div className="bg-white px-4 py-2.5">
                      <p className="text-sm font-medium text-navy-light">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* اطلاعات تماس */}
        <div className="mt-10 rounded-2xl bg-gradient-to-l from-rose-50 to-pink-50 border border-pink/30 px-6 py-5 text-center">
          <p className="text-sm font-semibold text-navy">برای ثبت‌نام یا اطلاعات بیشتر با ما تماس بگیرید</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
            <a href="tel:03132303433" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-pink-deep shadow-sm hover:shadow-md transition ltr">
              ۰۳۱–۳۲۳۰۳۴۳۳
            </a>
            <a href="tel:09130001965" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-pink-deep shadow-sm hover:shadow-md transition ltr">
              ۰۹۱۳۰۰۰۱۹۶۵
            </a>
          </div>
        </div>

      </article>
    </main>
  )
}
