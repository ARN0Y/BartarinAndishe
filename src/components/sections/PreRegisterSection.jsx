'use client'

import { useMemo, useState } from 'react'
import SectionShell from './SectionShell'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import { isCompleteJalali, resolveGradeFromBirthDate, UNKNOWN_GRADE_LABEL } from '@/lib/gradeLevel'
import { formatAcademicYearDisplay } from '@/lib/academicYear'

const GENDER_OPTIONS = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'دختر', label: 'دختر' },
  { value: 'پسر', label: 'پسر' },
]

const inputCls = 'w-full rounded-2xl border border-pink/30 px-4 py-3 text-sm outline-none focus:border-pink-deep bg-card'
const labelCls = 'mb-1 block text-xs font-bold text-foreground'

export default function PreRegisterSection({
  hideShell = false,
  academicYear,
  gradeRanges = [],
  gradeRangesConfigured = false,
}) {
  const [form, setForm] = useState({ firstName: '', lastName: '', nationalId: '', phone: '', birthDate: '', gender: '' })
  const [status, setStatus] = useState(null)
  const [errMsg, setErrMsg] = useState('')
  const academicYearDisplay = academicYear ? formatAcademicYearDisplay(academicYear) : null

  const resolvedGrade = useMemo(() => {
    if (!isCompleteJalali(form.birthDate)) return null
    return resolveGradeFromBirthDate(form.birthDate, gradeRanges)
  }, [form.birthDate, gradeRanges])

  function update(field, value) {
    setForm((v) => ({ ...v, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setErrMsg(json.message || 'خطا در ثبت'); setStatus('error'); return }
      setStatus('success')
      setForm({ firstName: '', lastName: '', nationalId: '', phone: '', birthDate: '', gender: '' })
    } catch {
      setErrMsg('خطا در اتصال به سرور.')
      setStatus('error')
    }
  }

  const formContent = (
    <>
      {status === 'success' ? (
        <div className="mx-auto max-w-lg rounded-3xl bg-green-50 p-8 text-center shadow-lg ring-1 ring-green-200">
          <p className="text-4xl">🎉</p>
          <h3 className="mt-4 text-xl font-extrabold text-green-700">پیش ثبت‌نام با موفقیت ثبت شد!</h3>
          {academicYearDisplay && (
            <p className="mt-1 text-xs font-semibold text-green-600">سال تحصیلی {academicYearDisplay}</p>
          )}
          <p className="mt-2 text-sm text-green-600 leading-7">
            اطلاعات شما دریافت شد. پس از بررسی توسط مدیریت و تأیید ثبت‌نام، اطلاع‌رسانی خواهیم کرد.
          </p>
          <button
            type="button"
            onClick={() => setStatus(null)}
            className="mt-5 rounded-2xl bg-gradient-to-l from-pink-deep to-rose px-6 py-3 text-sm font-bold text-white shadow"
          >
            ثبت فرم جدید
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mx-auto max-w-xl space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>نام نوآموز <span className="text-red-400">*</span></label>
              <input
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className={inputCls}
                placeholder="مثال: علی"
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className={labelCls}>نام خانوادگی <span className="text-red-400">*</span></label>
              <input
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className={inputCls}
                placeholder="مثال: احمدی"
                required
                maxLength={80}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>کد ملی نوآموز</label>
              <input
                value={form.nationalId}
                onChange={(e) => update('nationalId', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`${inputCls} ltr text-right`}
                placeholder="10 رقم"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className={labelCls}>شماره تماس <span className="text-red-400">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={`${inputCls} ltr text-right`}
                placeholder="09XXXXXXXXX"
                required
                maxLength={15}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>تاریخ تولد (شمسی)</label>
              <JalaliDatePicker
                value={form.birthDate}
                onChange={(v) => update('birthDate', v)}
                yearStart={1395}
                yearEnd={1410}
              />
              {isCompleteJalali(form.birthDate) && gradeRangesConfigured && (
                <div className="mt-2">
                  <p className={`rounded-xl px-3 py-2 text-xs font-bold ring-1 ${
                    resolvedGrade
                      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                      : 'bg-muted text-foreground ring-slate-200'
                  }`}>
                    پایه تحصیلی: {resolvedGrade?.gradeLabel || UNKNOWN_GRADE_LABEL}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>جنسیت</label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className={inputCls}
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {errMsg && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 ring-1 ring-red-200">
              {errMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-2xl bg-gradient-to-l from-pink-deep to-rose py-4 text-base font-extrabold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' ? 'در حال ثبت...' : 'ثبت پیش ثبت‌نام'}
          </button>
        </form>
      )}
    </>
  )

  if (hideShell) return formContent

  return (
    <SectionShell
      id="pre-register"
      badge="ثبت‌نام"
      title="پیش ثبت‌نام"
      subtitle={academicYearDisplay
        ? `پیش ثبت‌نام سال تحصیلی ${academicYearDisplay} — فرم را تکمیل کنید تا با شما تماس بگیریم.`
        : 'فرم پیش ثبت‌نام نوآموز را تکمیل کنید تا با شما تماس بگیریم.'}
    >
      {formContent}
    </SectionShell>
  )
}
