'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminButton, AdminBadge, inputCls, labelCls } from '@/components/admin/ui/AdminUI'

export default function SpotDifferenceGameManager({ gameId }) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', imageLeft: null, imageRight: null })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/spot-difference-games/${gameId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setGame(json.game)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    load()
  }, [load])

  async function addStage(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.set('title', form.title || `مرحله ${(game?.stages?.length || 0) + 1}`)
      fd.set('imageLeft', form.imageLeft)
      fd.set('imageRight', form.imageRight)
      const res = await fetch(`/api/admin/spot-difference-games/${gameId}/stages`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setForm({ title: '', imageLeft: null, imageRight: null })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeStage(stageId) {
    if (!confirm('این مرحله حذف شود؟')) return
    await fetch(`/api/admin/spot-difference-games/${gameId}/stages/${stageId}`, {
      method: 'DELETE',
    })
    await load()
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-400">در حال بارگذاری...</p>
  }

  if (!game) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'بازی یافت نشد.'}</p>
        <Link href="/admin/dashboard?tab=worksheets" className="text-sm font-bold text-navy">← بازگشت</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard?tab=worksheets" className="text-sm font-bold text-navy-light hover:text-pink-deep">
          ← بازگشت به کاربرگ‌ها
        </Link>
        <h1 className="mt-2 text-xl font-extrabold text-navy">مدیریت مراحل — {game.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          برای هر مرحله دو تصویر مشابه آپلود کنید، سپس تفاوت‌ها را علامت بزنید.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <form onSubmit={addStage} className="rounded-3xl bg-white p-5 shadow ring-1 ring-navy/10">
        <h2 className="font-extrabold text-navy">افزودن مرحله جدید</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelCls}>عنوان مرحله (اختیاری)</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls}
              placeholder={`مرحله ${game.stages.length + 1}`}
            />
          </div>
          <div>
            <label className={labelCls}>تصویر اول</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setForm((f) => ({ ...f, imageLeft: e.target.files?.[0] || null }))}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>تصویر دوم (با تفاوت‌ها)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setForm((f) => ({ ...f, imageRight: e.target.files?.[0] || null }))}
              className={inputCls}
              required
            />
          </div>
          <div className="flex items-end">
            <AdminButton type="submit" className="w-full" disabled={saving}>
              {saving ? 'در حال ثبت...' : 'افزودن مرحله'}
            </AdminButton>
          </div>
        </div>
      </form>

      {game.stages.length === 0 ? (
        <div className="rounded-3xl bg-amber-50 p-6 text-center text-sm text-amber-800 ring-1 ring-amber-200">
          هنوز مرحله‌ای ثبت نشده — اولین مرحله را اضافه کنید.
        </div>
      ) : (
        <div className="grid gap-4">
          {game.stages.map((stage, index) => (
            <article key={stage.id} className="rounded-3xl bg-white p-5 shadow ring-1 ring-navy/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-navy">{stage.title || `مرحله ${index + 1}`}</h3>
                  <p className="mt-1 text-xs font-bold text-violet-700">
                    {stage.spotCount} تفاوت علامت‌گذاری شده
                  </p>
                </div>
                <AdminBadge variant={stage.spotCount > 0 ? 'success' : 'warning'}>
                  {stage.spotCount > 0 ? 'آماده' : 'نیاز به علامت‌گذاری'}
                </AdminBadge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <img src={stage.imageLeft} alt="" className="rounded-xl ring-1 ring-slate-200" />
                <img src={stage.imageRight} alt="" className="rounded-xl ring-1 ring-slate-200" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/dashboard/spot-difference/${gameId}/stage/${stage.id}`}>
                  <AdminButton type="button" variant="secondary" size="sm">
                    علامت‌گذاری تفاوت‌ها
                  </AdminButton>
                </Link>
                <AdminButton type="button" variant="danger" size="sm" onClick={() => removeStage(stage.id)}>
                  حذف مرحله
                </AdminButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
