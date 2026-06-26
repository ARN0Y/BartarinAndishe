'use client'

import { useEffect, useState } from 'react'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import { AdminButton, AdminPanel, labelCls } from '@/components/admin/ui/AdminUI'

const inputCls = 'w-full rounded-md border border-violet-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400'

export default function AdminGradeRangesPanel({ year, embedded = false }) {
  const [ranges, setRanges] = useState([])
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/grade-ranges?year=${encodeURIComponent(year)}`)
      const json = await res.json()
      if (res.ok) {
        setRanges(json.ranges || [])
        setConfigured(!!json.configured)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [year])

  function updateRange(gradeKey, field, value) {
    setRanges((prev) =>
      prev.map((r) => (r.gradeKey === gradeKey ? { ...r, [field]: value } : r)),
    )
  }

  async function save() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/grade-ranges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, ranges }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMsg({ type: 'error', text: json.message || 'خطا در ذخیره' })
        return
      }
      setRanges(json.ranges || [])
      setConfigured(true)
      setMsg({ type: 'success', text: 'بازه‌های تاریخ تولد ذخیره شد.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPanel className={embedded ? 'rounded-t-none border-t-0 -mt-px' : 'mb-5'}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-violet-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">پایه تحصیلی بر اساس تاریخ تولد</h3>
          <p className="mt-1 text-xs text-slate-600">
            برای سال تحصیلی <strong>{year}</strong> بازه تاریخ تولد هر پایه را تعریف کنید.
            این بازه‌ها در فرم پیش‌ثبت‌نام نمایش داده می‌شوند و پایه نوآموز از روی تاریخ تولد تشخیص داده می‌شود.
          </p>
        </div>
        {configured ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            تنظیم شده
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
            نیاز به تنظیم
          </span>
        )}
      </div>

      {loading ? (
        <p className="px-4 py-6 text-sm text-slate-500">در حال بارگذاری...</p>
      ) : (
        <div className="px-4 py-4">
          {!configured && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              قبل از فعال‌سازی این سال برای پیش‌ثبت‌نام، لطفاً هر سه بازه را کامل کنید.
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-right text-xs font-bold text-slate-600">
                  <th className="px-3 py-2">پایه تحصیلی</th>
                  <th className="px-3 py-2">از تاریخ تولد</th>
                  <th className="px-3 py-2">تا تاریخ تولد</th>
                </tr>
              </thead>
              <tbody>
                {ranges.map((row) => (
                  <tr key={row.gradeKey} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">{row.gradeLabel}</td>
                    <td className="px-3 py-2">
                      <JalaliDatePicker
                        value={row.birthFrom}
                        onChange={(v) => updateRange(row.gradeKey, 'birthFrom', v)}
                        yearStart={1395}
                        yearEnd={1410}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <JalaliDatePicker
                        value={row.birthTo}
                        onChange={(v) => updateRange(row.gradeKey, 'birthTo', v)}
                        yearStart={1395}
                        yearEnd={1410}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {msg && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {msg.text}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" size="sm" disabled={saving} onClick={save}>
              {saving ? 'در حال ذخیره...' : 'ذخیره بازه‌ها'}
            </AdminButton>
            <AdminButton variant="secondary" size="sm" disabled={loading} onClick={load}>
              بارگذاری مجدد
            </AdminButton>
          </div>
        </div>
      )}
    </AdminPanel>
  )
}
