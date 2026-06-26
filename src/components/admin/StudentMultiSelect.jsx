'use client'

import { useMemo, useState } from 'react'

export default function StudentMultiSelect({
  students = [],
  selectedIds = [],
  onChange,
  academicYear,
  disabled = false,
  label = null,
  showAllWhenEmpty = true,
  required = false,
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedSet = useMemo(() => new Set(selectedIds.map(Number)), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return showAllWhenEmpty ? students : []
    return students.filter((s) => {
      const full = `${s.firstName} ${s.lastName}`.toLowerCase()
      return full.includes(q) || String(s.nationalId || '').includes(q)
    })
  }, [students, query, showAllWhenEmpty])

  const canShowDropdown = open && students.length > 0 && (showAllWhenEmpty || query.trim().length > 0)

  const selectedStudents = useMemo(
    () => students.filter((s) => selectedSet.has(s.id)),
    [students, selectedSet]
  )

  function toggle(id) {
    const num = Number(id)
    if (selectedSet.has(num)) {
      onChange(selectedIds.filter((x) => Number(x) !== num))
    } else {
      onChange([...selectedIds, num])
    }
  }

  function selectAllFiltered() {
    const merged = new Set([...selectedIds.map(Number), ...filtered.map((s) => s.id)])
    onChange([...merged])
  }

  function clearAll() {
    onChange([])
  }

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-[10px] font-bold text-slate-500">
          {label || `نوآموزان${academicYear ? ` (سال تحصیلی ${academicYear})` : ''}`}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] font-semibold text-red-600 hover:text-red-700"
          >
            پاک کردن انتخاب
          </button>
        )}
      </div>

      {selectedStudents.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedStudents.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-800 hover:bg-violet-200"
            >
              {s.firstName} {s.lastName}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          disabled={disabled || !students.length}
          placeholder={
            students.length
              ? (showAllWhenEmpty ? 'جستجوی نام یا کد ملی...' : 'نام یا کد ملی را تایپ کنید...')
              : 'نوآموزی یافت نشد'
          }
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 disabled:bg-slate-50"
        />

        {canShowDropdown && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              aria-label="بستن"
              onClick={() => setOpen(false)}
            />
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-[10px] font-bold text-slate-500">
                  {filtered.length} نفر — {selectedIds.length} انتخاب‌شده
                </span>
                {filtered.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="text-[10px] font-semibold text-violet-700 hover:text-violet-900"
                  >
                    انتخاب همه نتایج
                  </button>
                )}
              </div>
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-slate-400">
                  {query.trim() ? 'نتیجه‌ای یافت نشد' : 'برای جستجو شروع به تایپ کنید'}
                </p>
              ) : (
                filtered.map((s) => {
                  const checked = selectedSet.has(s.id)
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-violet-50 ${checked ? 'bg-violet-50/80' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(s.id)}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-800">{s.firstName} {s.lastName}</span>
                        <span className="mr-2 text-xs text-slate-400 ltr">{s.nationalId}</span>
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
