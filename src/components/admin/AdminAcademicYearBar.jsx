'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminButton } from '@/components/admin/ui/AdminUI'
import AdminGradeRangesPanel from '@/components/admin/AdminGradeRangesPanel'
import { CalendarDays, Download, FileSpreadsheet, Plus, Trash2 } from 'lucide-react'

export default function AdminAcademicYearBar({ onChanged }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams?.get('tab') || 'preReg'
  const year = searchParams?.get('year') || '1405-1406'

  const [years, setYears] = useState([year])
  const [activeYear, setActiveYear] = useState(null)
  const [purging, setPurging] = useState(false)
  const [activating, setActivating] = useState(false)

  async function refreshYears() {
    const json = await fetch('/api/admin/academic-years').then((r) => r.json())
    const list = json.years?.length ? json.years : [year]
    setYears(list)
    if (json.active) setActiveYear(json.active)
    return json
  }

  useEffect(() => {
    refreshYears().catch(() => setYears([year]))
  }, [year])

  function setYear(nextYear) {
    router.replace(`/admin/dashboard?tab=${tab}&year=${encodeURIComponent(nextYear)}`, { scroll: false })
    onChanged?.(nextYear)
  }

  async function activateYear() {
    if (year === activeYear) return

    try {
      const grRes = await fetch(`/api/admin/grade-ranges?year=${encodeURIComponent(year)}`)
      const grJson = await grRes.json()
      if (grRes.ok && !grJson.configured) {
        const ok = window.confirm(
          `بازه‌های تاریخ تولد برای سال «${year}» هنوز تعریف نشده است.\n\nتوصیه می‌شود ابتدا در بخش «پایه تحصیلی بر اساس تاریخ تولد» بازه‌ها را تنظیم کنید.\n\nبا این حال این سال فعال شود؟`,
        )
        if (!ok) return
      }
    } catch {
      /* ادامه بدون مسدودسازی */
    }

    setActivating(true)
    try {
      const res = await fetch('/api/admin/academic-years', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json.message || 'خطا در فعال‌سازی')
        return
      }
      setActiveYear(json.active)
      if (json.years?.length) setYears(json.years)
      alert(json.message || `سال ${json.active} فعال شد.`)
      onChanged?.(json.active)
    } finally {
      setActivating(false)
    }
  }

  function triggerDownload(url) {
    const a = document.createElement('a')
    a.href = url
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function purgeYear() {
    if (year === activeYear) {
      const ok = window.confirm(
        `سال «${year}» سال فعال پیش‌ثبت‌نام است.\n\nبا حذف این سال، پیش‌ثبت‌نام‌های جدید همچنان به همین سال می‌روند تا سال دیگری را فعال کنید.\n\nادامه می‌دهید؟`
      )
      if (!ok) return
    }

    // مرحلهٔ ۱ — بک‌آپ اجباری: قبل از حذف، دو اکسل بک‌آپ (نوآموزان و مالی) دانلود می‌شود
    const wantBackup = window.confirm(
      `قبل از حذف داده‌های سال «${year}»، یک بک‌آپ کامل (اطلاعات نوآموزان + مالی) به‌صورت اکسل دانلود می‌شود.\n\nبرای شروع دانلود بک‌آپ روی «تأیید» بزنید.`
    )
    if (!wantBackup) return
    triggerDownload(`/api/admin/profiles/export?academicYear=${encodeURIComponent(year)}`)
    triggerDownload(`/api/admin/finance/export?academicYear=${encodeURIComponent(year)}`)

    const backupOk = window.confirm(
      `آیا فایل‌های بک‌آپ با موفقیت دانلود و ذخیره شدند؟\n\nفقط در صورتی ادامه دهید که از سالم بودن بک‌آپ مطمئن هستید. این عملیات قابل بازگشت نیست.`
    )
    if (!backupOk) return

    const typed = window.prompt(
      `حذف کامل داده‌های سال تحصیلی «${year}»\n\nپیش‌ثبت‌نام، ثبت‌نام قطعی، پروفایل و اطلاعات مالی این سال حذف می‌شود.\n\nبرای تأیید نهایی، سال تحصیلی را دقیقاً تایپ کنید:`,
      ''
    )
    if (typed !== year) return

    setPurging(true)
    try {
      const res = await fetch(`/api/admin/academic-years/${encodeURIComponent(year)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: year }),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json.message || 'خطا در حذف')
        return
      }
      alert(`داده‌های سال ${year} پاک شد.`)
      onChanged?.(year)
      await refreshYears()
    } finally {
      setPurging(false)
    }
  }

  const isActive = activeYear && year === activeYear

  return (
    <div className="mb-5 space-y-0">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            سال تحصیلی (نمایش در پنل)
          </p>
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring min-w-[140px]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}{activeYear === y ? ' ✓ فعال' : ''}
                </option>
              ))}
            </select>
            {isActive && (
              <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                سال فعال پیش‌ثبت‌نام
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground pb-2 max-w-md">
          {activeYear
            ? <>پیش‌ثبت‌نام سایت: <strong className="text-foreground">{activeYear}</strong> — نمایش پنل بر اساس سال انتخاب‌شده بالا.</>
            : 'پیش‌ثبت‌نام، ثبت‌نام قطعی و مالی بر اساس سال انتخاب‌شده نمایش داده می‌شود.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AdminButton asChild variant="secondary" size="sm">
          <a href={`/api/admin/finance/export?academicYear=${encodeURIComponent(year)}`}>
            <Download className="h-3.5 w-3.5" />
            خروجی مالی سال
          </a>
        </AdminButton>
        <AdminButton asChild variant="secondary" size="sm">
          <a href={`/api/admin/profiles/export?academicYear=${encodeURIComponent(year)}`}>
            <FileSpreadsheet className="h-3.5 w-3.5" />
            بک‌آپ نوآموزان سال
          </a>
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => triggerDownload('/api/admin/academic-years/export')}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          گزارش سال‌ها
        </AdminButton>
        {!isActive && (
          <AdminButton variant="primary" size="sm" disabled={activating} onClick={activateYear}>
            {activating ? 'در حال فعال‌سازی...' : `فعال کردن ${year} برای پیش‌ثبت‌نام`}
          </AdminButton>
        )}
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => {
            const next = window.prompt('سال تحصیلی جدید (مثال 1406-1407):', '')
            if (next?.trim()) setYear(next.trim())
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          سال جدید
        </AdminButton>
        <AdminButton variant="danger" size="sm" disabled={purging} onClick={purgeYear}>
          <Trash2 className="h-3.5 w-3.5" />
          {purging ? 'در حال حذف...' : 'پاک کردن کامل این سال تحصیلی'}
        </AdminButton>
      </div>
      </div>
      {tab === 'preReg' ? <AdminGradeRangesPanel year={year} embedded /> : null}
    </div>
  )
}
