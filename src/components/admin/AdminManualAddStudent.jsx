'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminButton, inputCls } from '@/components/admin/ui/AdminUI'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import { isCompleteJalali, resolveGradeFromBirthDate, UNKNOWN_GRADE_LABEL } from '@/lib/gradeLevel'
import { UserPlus, X } from 'lucide-react'

const EMPTY = { firstName: '', lastName: '', nationalId: '', studentCode: '', phone: '', birthDate: '', gender: '' }

export default function AdminManualAddStudent({ academicYear, onAdded }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [gradeRanges, setGradeRanges] = useState([])
  const [gradeRangesConfigured, setGradeRangesConfigured] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  useEffect(() => {
    if (!open) return
    let active = true
    fetch(`/api/admin/grade-ranges?year=${encodeURIComponent(academicYear)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!active) return
        setGradeRanges(j.ranges || [])
        setGradeRangesConfigured(Boolean(j.configured))
      })
      .catch(() => {})
    return () => { active = false }
  }, [open, academicYear])

  const resolvedGrade = useMemo(() => {
    if (!isCompleteJalali(form.birthDate)) return null
    return resolveGradeFromBirthDate(form.birthDate, gradeRanges)
  }, [form.birthDate, gradeRanges])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/students?year=${encodeURIComponent(academicYear)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در افزودن نوآموز')
      setForm(EMPTY)
      setOpen(false)
      onAdded?.(json.studentId)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminButton variant="success" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> افزودن دستی نوآموز
      </AdminButton>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10">
          <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <UserPlus className="h-5 w-5 text-emerald-600" /> افزودن دستی نوآموز (ثبت حضوری)
              </h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={submit} className="space-y-4 p-5">
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                این نوآموز به‌صورت «ثبت‌نام قطعی» در سال {academicYear} ثبت می‌شود. رمز ورود اولیا در ابتدا همان کد ملی نوآموز خواهد بود.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">نام <span className="text-destructive">*</span></label>
                  <input className={inputCls} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">نام خانوادگی <span className="text-destructive">*</span></label>
                  <input className={inputCls} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">کد ملی <span className="text-destructive">*</span></label>
                  <input className={inputCls + ' ltr text-right'} value={form.nationalId} inputMode="numeric" maxLength={10}
                    onChange={(e) => set('nationalId', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="۱۰ رقم" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">کد نوآموز</label>
                  <input className={inputCls + ' ltr text-right'} value={form.studentCode} onChange={(e) => set('studentCode', e.target.value)} placeholder="اختیاری" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">تلفن همراه</label>
                  <input className={inputCls + ' ltr text-right'} value={form.phone} inputMode="numeric"
                    onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="اختیاری" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">جنسیت</label>
                  <select className={inputCls} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="">انتخاب کنید</option>
                    <option value="دختر">دختر</option>
                    <option value="پسر">پسر</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">تاریخ تولد (برای تعیین پایه)</label>
                  <JalaliDatePicker value={form.birthDate} onChange={(v) => set('birthDate', v)} yearStart={1399} yearEnd={1404} />
                  {isCompleteJalali(form.birthDate) && (
                    gradeRangesConfigured ? (
                      <p className={`mt-2 rounded-xl px-3 py-2 text-xs font-bold ring-1 ${
                        resolvedGrade
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-muted text-foreground ring-slate-200'
                      }`}>
                        پایه تحصیلی: {resolvedGrade?.gradeLabel || UNKNOWN_GRADE_LABEL}
                      </p>
                    ) : (
                      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                        بازه‌های تاریخ تولد پایه‌ها برای این سال تنظیم نشده است؛ ابتدا در «پایه‌بندی سنی» تنظیم کنید.
                      </p>
                    )
                  )}
                </div>
              </div>

              {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{error}</p> : null}

              <div className="flex justify-end gap-2">
                <AdminButton variant="secondary" onClick={() => setOpen(false)}>انصراف</AdminButton>
                <AdminButton type="submit" variant="primary" disabled={saving}>
                  {saving ? 'در حال ثبت...' : 'ثبت نوآموز'}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
