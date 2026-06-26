'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminButton, AdminBadge, inputCls, labelCls } from '@/components/admin/ui/AdminUI'

function PairForm({ stageId, gameId, onAdded }) {
  const [imageA, setImageA] = useState(null)
  const [imageB, setImageB] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.set('imageA', imageA)
      fd.set('imageB', imageB)
      const res = await fetch(`/api/admin/matching-games/${gameId}/stages/${stageId}/pairs`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setImageA(null)
      setImageB(null)
      e.target.reset()
      onAdded()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
      <p className="text-xs font-bold text-violet-800">افزودن یک جفت (ستون اول ↔ ستون دوم)</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>ستون اول (مثلاً حیوان)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageA(e.target.files?.[0] || null)}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>ستون دوم (مثلاً غذا)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageB(e.target.files?.[0] || null)}
            className={inputCls}
            required
          />
        </div>
        <div className="flex items-end">
          <AdminButton type="submit" className="w-full" size="sm" disabled={saving}>
            {saving ? 'در حال آپلود...' : 'افزودن جفت'}
          </AdminButton>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </form>
  )
}

export default function MatchingGameManager({ gameId }) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [stageTitle, setStageTitle] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/matching-games/${gameId}`)
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
      const res = await fetch(`/api/admin/matching-games/${gameId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: stageTitle || `مرحله ${(game?.stages?.length || 0) + 1}`,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setStageTitle('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeStage(stageId) {
    if (!confirm('این مرحله و همه جفت‌های آن حذف شود؟')) return
    await fetch(`/api/admin/matching-games/${gameId}/stages/${stageId}`, { method: 'DELETE' })
    await load()
  }

  async function removePair(stageId, pairId) {
    if (!confirm('این جفت تصویر حذف شود؟')) return
    await fetch(`/api/admin/matching-games/${gameId}/stages/${stageId}/pairs/${pairId}`, {
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
        <h1 className="mt-2 text-xl font-extrabold text-navy">مدیریت جفت‌ها — {game.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          برای هر مرحله، جفت‌های مرتبط را تعریف کنید — مثلاً ۵ حیوان در ستون اول و ۵ غذا در ستون دوم.
          نوآموز با کلیک روی دایره کنار هر تصویر، آن‌ها را به هم وصل می‌کند.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <form onSubmit={addStage} className="rounded-3xl bg-white p-5 shadow ring-1 ring-navy/10">
        <h2 className="font-extrabold text-navy">افزودن مرحله جدید</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="min-w-[200px] flex-1">
            <label className={labelCls}>عنوان مرحله (اختیاری)</label>
            <input
              value={stageTitle}
              onChange={(e) => setStageTitle(e.target.value)}
              className={inputCls}
              placeholder={`مرحله ${game.stages.length + 1}`}
            />
          </div>
          <div className="flex items-end">
            <AdminButton type="submit" disabled={saving}>
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
        <div className="grid gap-6">
          {game.stages.map((stage, index) => (
            <article key={stage.id} className="rounded-3xl bg-white p-5 shadow ring-1 ring-navy/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-navy">{stage.title || `مرحله ${index + 1}`}</h3>
                  <p className="mt-1 text-xs font-bold text-violet-700">{stage.pairCount} جفت تصویر</p>
                </div>
                <AdminBadge variant={stage.pairCount > 0 ? 'success' : 'warning'}>
                  {stage.pairCount > 0 ? 'آماده' : 'نیاز به جفت تصویر'}
                </AdminBadge>
              </div>

              {stage.pairs.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stage.pairs.map((pair, pairIndex) => (
                    <div key={pair.id} className="rounded-2xl border border-slate-200 p-3">
                      <p className="mb-2 text-[10px] font-bold text-slate-500">جفت {pairIndex + 1}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="mb-1 text-[9px] font-bold text-slate-400">ستون اول</p>
                          <img src={pair.imageA} alt="" className="aspect-square rounded-xl object-cover ring-1 ring-slate-200" />
                        </div>
                        <div>
                          <p className="mb-1 text-[9px] font-bold text-slate-400">ستون دوم</p>
                          <img src={pair.imageB} alt="" className="aspect-square rounded-xl object-cover ring-1 ring-slate-200" />
                        </div>
                      </div>
                      <AdminButton
                        type="button"
                        variant="danger"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => removePair(stage.id, pair.id)}
                      >
                        حذف جفت
                      </AdminButton>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">هنوز جفت تصویری اضافه نشده.</p>
              )}

              <PairForm stageId={stage.id} gameId={gameId} onAdded={load} />

              <div className="mt-4">
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
