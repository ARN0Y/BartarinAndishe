'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import { GraduationCap, Plus, Trash2, Users, School, Save } from 'lucide-react'

export default function AdminClassesPanel({ academicYear }) {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', teacherName: '', capacity: '' })
  const [creating, setCreating] = useState(false)
  const [filterClass, setFilterClass] = useState('all') // 'all' | 'none' | id

  const yearQs = `year=${encodeURIComponent(academicYear)}`

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/classes?${yearQs}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در دریافت')
      setClasses(json.classes || [])
      setStudents(json.students || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [academicYear])

  async function createClass(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/admin/classes?${yearQs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setForm({ name: '', teacherName: '', capacity: '' })
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function saveClass(cls) {
    const res = await fetch(`/api/admin/classes/${cls.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cls.name, teacherName: cls.teacherName, capacity: cls.capacity }),
    })
    const json = await res.json()
    if (!res.ok) { alert(json.message || 'خطا'); return }
    await load()
  }

  async function removeClass(cls) {
    if (!window.confirm(`حذف کلاس «${cls.name}»؟ نوآموزان این کلاس بدون کلاس می‌شوند.`)) return
    const res = await fetch(`/api/admin/classes/${cls.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) { alert(json.message || 'خطا'); return }
    await load()
  }

  async function assign(studentId, classId) {
    // به‌روزرسانی خوش‌بینانه
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, classId: classId ?? null } : s)))
    const res = await fetch('/api/admin/classes/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, classId }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      alert(json.message || 'خطا در انتساب')
      await load()
      return
    }
    // به‌روزرسانی شمارش کلاس‌ها
    await load()
  }

  const classCount = (id) => students.filter((s) => s.classId === id).length
  const unassignedCount = students.filter((s) => !s.classId).length

  const visibleStudents = students.filter((s) => {
    if (filterClass === 'all') return true
    if (filterClass === 'none') return !s.classId
    return s.classId === Number(filterClass)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <School className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">کلاس‌بندی نوآموزان — سال {academicYear}</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        ابتدا کلاس‌ها را با نام مربی تعریف کنید، سپس هر نوآموز ثبت‌نام قطعی را به کلاس مربوطه نسبت دهید.
      </p>

      {error ? <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive">{error}</p> : null}

      {/* ساخت کلاس جدید */}
      <AdminPanel>
        <form onSubmit={createClass} className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-medium">نام کلاس</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="مثلاً ستاره‌ها" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">نام مربی</label>
            <input className={inputCls} value={form.teacherName} onChange={(e) => setForm((v) => ({ ...v, teacherName: e.target.value }))} placeholder="نام مربی کلاس" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">ظرفیت</label>
            <input className={inputCls} value={form.capacity} onChange={(e) => setForm((v) => ({ ...v, capacity: e.target.value.replace(/\D/g, '') }))} placeholder="اختیاری" inputMode="numeric" />
          </div>
          <AdminButton type="submit" variant="primary" disabled={creating || !form.name.trim()}>
            <Plus className="h-4 w-4" /> افزودن کلاس
          </AdminButton>
        </form>
      </AdminPanel>

      {/* فهرست کلاس‌ها */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <input
                    className="w-full border-0 bg-transparent text-sm font-bold text-foreground outline-none"
                    value={cls.name}
                    onChange={(e) => setClasses((prev) => prev.map((c) => (c.id === cls.id ? { ...c, name: e.target.value } : c)))}
                  />
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {classCount(cls.id).toLocaleString('fa-IR')} نوآموز
                    {cls.capacity ? ` / ظرفیت ${Number(cls.capacity).toLocaleString('fa-IR')}` : ''}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => removeClass(cls)} className="text-destructive" title="حذف کلاس">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_90px] gap-2">
              <input
                className={inputCls + ' h-8'}
                value={cls.teacherName || ''}
                placeholder="نام مربی"
                onChange={(e) => setClasses((prev) => prev.map((c) => (c.id === cls.id ? { ...c, teacherName: e.target.value } : c)))}
              />
              <input
                className={inputCls + ' h-8'}
                value={cls.capacity ?? ''}
                placeholder="ظرفیت"
                inputMode="numeric"
                onChange={(e) => setClasses((prev) => prev.map((c) => (c.id === cls.id ? { ...c, capacity: e.target.value.replace(/\D/g, '') } : c)))}
              />
            </div>
            <AdminButton variant="secondary" size="sm" className="mt-2 w-full" onClick={() => saveClass(cls)}>
              <Save className="h-3.5 w-3.5" /> ذخیره تغییرات
            </AdminButton>
          </div>
        ))}
        {!loading && classes.length === 0 ? (
          <p className="col-span-full rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            هنوز کلاسی تعریف نشده است.
          </p>
        ) : null}
      </div>

      {/* انتساب نوآموزان */}
      <AdminPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground">انتساب نوآموزان به کلاس</h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">فیلتر:</span>
            <button onClick={() => setFilterClass('all')} className={`rounded-md px-2 py-1 font-semibold ${filterClass === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>همه ({students.length.toLocaleString('fa-IR')})</button>
            <button onClick={() => setFilterClass('none')} className={`rounded-md px-2 py-1 font-semibold ${filterClass === 'none' ? 'bg-amber-500 text-white' : 'bg-muted'}`}>بدون کلاس ({unassignedCount.toLocaleString('fa-IR')})</button>
            {classes.map((c) => (
              <button key={c.id} onClick={() => setFilterClass(String(c.id))} className={`rounded-md px-2 py-1 font-semibold ${filterClass === String(c.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{c.name}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
        ) : visibleStudents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">نوآموزی برای نمایش نیست.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-right">نوآموز</th>
                  <th className="px-3 py-2 text-right">پایه</th>
                  <th className="px-3 py-2 text-right">کد ملی</th>
                  <th className="px-3 py-2 text-right w-52">کلاس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-semibold text-foreground">{s.fullName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{s.gradeLevel || '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs ltr text-right">{s.nationalId}</td>
                    <td className="px-3 py-2">
                      <select
                        value={s.classId ?? ''}
                        onChange={(e) => assign(s.id, e.target.value ? Number(e.target.value) : null)}
                        className={`h-8 w-full rounded-md border px-2 text-xs font-semibold outline-none ${s.classId ? 'border-primary/40 bg-primary/5 text-primary' : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30'}`}
                      >
                        <option value="">— بدون کلاس —</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}{c.teacherName ? ` (${c.teacherName})` : ''}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  )
}
