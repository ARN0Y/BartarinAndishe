'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AdminPageHeader, AdminPanel, AdminButton, AdminBadge, inputCls, labelCls,
} from '@/components/admin/ui/AdminUI'
import AmountRialHint from '@/components/admin/AmountRialHint'
import { Plus, Trash2, Pencil, Users, Eye, EyeOff, Tent, CheckCircle2 } from 'lucide-react'

function formatThousands(val) {
  const d = String(val || '').replace(/\D/g, '')
  return d ? Number(d).toLocaleString('en-US') : ''
}

export default function AdminExcursionsPanel({ academicYear }) {
  const [excursions, setExcursions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', costRial: '' })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', costRial: '' })
  const [summaryFor, setSummaryFor] = useState(null)
  const [summary, setSummary] = useState(null)

  const yearQs = `academicYear=${encodeURIComponent(academicYear)}`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/excursions?${yearQs}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setExcursions(json.excursions || [])
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [yearQs])

  useEffect(() => { load() }, [load])

  async function create(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/excursions?${yearQs}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: form.description, costRial: form.costRial.replace(/\D/g, '') }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setForm({ title: '', description: '', costRial: '' })
      await load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function patch(id, data) {
    const res = await fetch(`/api/admin/excursions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.message || 'خطا'); return false }
    await load(); return true
  }

  async function remove(id) {
    if (!window.confirm('این اردو و همهٔ اطلاعات رضایت‌نامه‌های آن (اسامی نوآموزان) حذف شود؟ این عمل بازگشت‌ناپذیر است.')) return
    const res = await fetch(`/api/admin/excursions/${id}`, { method: 'DELETE' })
    if (!res.ok) { setError('خطا در حذف اردو'); return }
    if (summaryFor === id) { setSummaryFor(null); setSummary(null) }
    await load()
  }

  async function loadSummary(id) {
    if (summaryFor === id) { setSummaryFor(null); setSummary(null); return }
    setSummaryFor(id); setSummary(null)
    const res = await fetch(`/api/admin/excursions/${id}/summary`)
    const json = await res.json()
    if (res.ok) setSummary(json)
  }

  function startEdit(ex) {
    setEditingId(ex.id)
    setEditForm({ title: ex.title, description: ex.description, costRial: formatThousands(ex.costRial) })
  }
  async function saveEdit(id) {
    const ok = await patch(id, { title: editForm.title, description: editForm.description, costRial: editForm.costRial.replace(/\D/g, '') })
    if (ok) setEditingId(null)
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="اردوها"
        count={excursions.length}
        description={`تعریف اردو، متن رضایت‌نامه و هزینه — سال تحصیلی ${academicYear}. والدین در پنل خود رضایت‌نامه را با امضای الکترونیکی و تایید پیامکی امضا و هزینه را پرداخت می‌کنند.`}
      />

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <AdminPanel>
        <form onSubmit={create} className="space-y-3">
          <p className="text-sm font-bold text-foreground">تعریف اردوی جدید</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div>
              <label className={labelCls}>عنوان اردو</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} placeholder="مثلاً بازدید از آتش‌نشانی" />
            </div>
            <div>
              <label className={labelCls}>هزینه (ریال)</label>
              <input className={`${inputCls} ltr`} value={formatThousands(form.costRial)} onChange={(e) => setForm((v) => ({ ...v, costRial: e.target.value.replace(/\D/g, '') }))} placeholder="مثلاً 2,000,000" />
              {form.costRial ? <AmountRialHint rial={form.costRial} className="mt-1 text-xs text-muted-foreground" /> : null}
            </div>
          </div>
          <div>
            <label className={labelCls}>متن رضایت‌نامه (این اردو برای کجاست، جزئیات و هزینه)</label>
            <textarea className={`${inputCls} h-28 py-2`} value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} placeholder="متنی که والدین در پنل خود می‌بینند و باید آن را امضا کنند..." />
          </div>
          <AdminButton type="submit" variant="primary" disabled={saving || !form.title.trim()}>
            <Plus className="h-4 w-4" /> ایجاد اردو
          </AdminButton>
        </form>
      </AdminPanel>

      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
      ) : excursions.length === 0 ? (
        <AdminPanel><p className="py-6 text-center text-sm text-muted-foreground">هنوز اردویی تعریف نشده است.</p></AdminPanel>
      ) : (
        <div className="space-y-4">
          {excursions.map((ex) => (
            <AdminPanel key={ex.id}>
              {editingId === ex.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
                    <div>
                      <label className={labelCls}>عنوان</label>
                      <input className={inputCls} value={editForm.title} onChange={(e) => setEditForm((v) => ({ ...v, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>هزینه (ریال)</label>
                      <input className={`${inputCls} ltr`} value={editForm.costRial} onChange={(e) => setEditForm((v) => ({ ...v, costRial: formatThousands(e.target.value) }))} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>متن رضایت‌نامه</label>
                    <textarea className={`${inputCls} h-28 py-2`} value={editForm.description} onChange={(e) => setEditForm((v) => ({ ...v, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <AdminButton variant="primary" size="sm" onClick={() => saveEdit(ex.id)}>ذخیره</AdminButton>
                    <AdminButton variant="secondary" size="sm" onClick={() => setEditingId(null)}>انصراف</AdminButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink/10 text-pink-deep"><Tent className="h-5 w-5" /></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">{ex.title}</p>
                          <AdminBadge variant={ex.isActive ? 'success' : 'default'}>{ex.isActive ? 'فعال' : 'غیرفعال'}</AdminBadge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">هزینه: {ex.costFormatted} ریال — {(ex.consentCount || 0).toLocaleString('fa-IR')} رضایت‌نامه</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AdminButton variant="secondary" size="sm" onClick={() => loadSummary(ex.id)}><Users className="h-3.5 w-3.5" /> گزارش کلاسی</AdminButton>
                      <button type="button" onClick={() => patch(ex.id, { isActive: !ex.isActive })} className={ex.isActive ? 'text-emerald-600' : 'text-muted-foreground'} title={ex.isActive ? 'فعال (کلیک: غیرفعال)' : 'غیرفعال'}>
                        {ex.isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button type="button" onClick={() => startEdit(ex)} className="text-muted-foreground hover:text-foreground" title="ویرایش"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => remove(ex.id)} className="text-destructive" title="حذف اردو"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {ex.description ? <p className="mt-3 whitespace-pre-line rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs leading-6 text-muted-foreground">{ex.description}</p> : null}

                  {summaryFor === ex.id ? (
                    <div className="mt-4 border-t border-border pt-4">
                      {!summary ? (
                        <p className="text-center text-sm text-muted-foreground">در حال بارگذاری گزارش...</p>
                      ) : (
                        <ExcursionSummary summary={summary} />
                      )}
                    </div>
                  ) : null}
                </>
              )}
            </AdminPanel>
          ))}
        </div>
      )}
    </section>
  )
}

function ExcursionSummary({ summary }) {
  const groups = [...summary.classes, { id: '__none__', name: 'بدون کلاس', teacherName: '', ...summary.unassigned }]
    .filter((g) => g.total > 0)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <AdminBadge variant="success"><CheckCircle2 className="ml-1 inline h-3.5 w-3.5" /> تکمیل‌شده (امضا + پرداخت): {summary.totals.completed.toLocaleString('fa-IR')}</AdminBadge>
        <AdminBadge variant="info">امضاشده: {summary.totals.signed.toLocaleString('fa-IR')}</AdminBadge>
        <AdminBadge variant="warning">پرداخت‌شده: {summary.totals.paid.toLocaleString('fa-IR')}</AdminBadge>
      </div>
      {groups.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">هنوز هیچ نوآموزی رضایت‌نامه را تکمیل نکرده است.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <p className="text-sm font-bold text-foreground">{g.name}{g.teacherName ? ` — ${g.teacherName}` : ''}</p>
                <AdminBadge variant="success">{g.completedCount.toLocaleString('fa-IR')} تکمیل‌شده</AdminBadge>
              </div>
              <ul className="mt-2 space-y-1">
                {g.participants.map((p) => (
                  <li key={p.studentId} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground">{p.fullName} {p.studentCode ? <span className="text-muted-foreground">({p.studentCode})</span> : null}</span>
                    <span className="flex items-center gap-1.5">
                      <StatusDot ok={p.signed} label="امضا" />
                      <StatusDot ok={p.verified} label="تایید" />
                      <StatusDot ok={p.paid} label="پرداخت" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusDot({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
      {ok ? '✓' : '—'} {label}
    </span>
  )
}
