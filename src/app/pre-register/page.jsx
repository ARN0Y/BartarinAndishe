import PreRegisterSection from '@/components/sections/PreRegisterSection'
import Link from 'next/link'
import { getActiveAcademicYear, formatAcademicYearDisplay } from '@/lib/academicYear'
import { getGradeRangesForYear, gradeRangesConfiguredForYear } from '@/lib/services/gradeRangeService'

export const metadata = {
  title: 'پیش ثبت‌نام — کودکستان برترین اندیشه',
  description: 'فرم پیش ثبت‌نام در کودکستان برترین اندیشه',
}

export default async function PreRegisterPage() {
  const academicYear = await getActiveAcademicYear()
  const academicYearDisplay = formatAcademicYearDisplay(academicYear)
  const [gradeRanges, gradeRangesConfigured] = await Promise.all([
    getGradeRangesForYear(academicYear),
    gradeRangesConfiguredForYear(academicYear),
  ])

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top_right,var(--color-pink-soft)_0%,transparent_50%),linear-gradient(160deg,var(--color-cream)_0%,#fff_100%)]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-pink/15 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-navy hover:bg-pink-soft/50 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          بازگشت به سایت
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/logo.svg" alt="لوگو" className="h-8 w-auto" />
          <span className="hidden text-sm font-extrabold text-navy sm:block">کودکستان برترین اندیشه</span>
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-deep/10">
            <svg className="h-7 w-7 text-pink-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0V18a2.25 2.25 0 002.25 2.25h4.5A2.25 2.25 0 0021 18V8.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">پیش ثبت‌نام</h1>
          <p className="mt-2 text-sm font-semibold text-pink-deep">
            سال تحصیلی {academicYearDisplay}
          </p>
        </div>

        <div className="card-surface p-6">
          <PreRegisterSection
            hideShell
            academicYear={academicYear}
            gradeRanges={gradeRanges}
            gradeRangesConfigured={gradeRangesConfigured}
          />
        </div>
      </main>
    </div>
  )
}
