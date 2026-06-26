'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AdminPanel,
  AdminButton,
  AdminBadge,
  inputCls,
  labelCls,
} from '@/components/admin/ui/AdminUI'

export default function AdminSpotDifferencePanel() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', slug: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/spot-difference-games')
      const text = await res.text()
      let json
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error('خطا در ارتباط با سرور. لطفاً یک بار سرور را متوقف و دوباره npm run dev را اجرا کنید.')
      }
      if (!res.ok) throw new Error(json.message || 'خطا در دریافت بازی‌ها')
      setGames(json.games || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function submitGame(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/spot-difference-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setForm({ title: '', description: '', slug: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleVisible(game) {
    await fetch(`/api/admin/spot-difference-games/${game.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !game.isVisible }),
    })
    await load()
  }

  async function removeGame(id) {
    if (!confirm('این بازی و همه مراحل آن حذف شود؟')) return
    await fetch(`/api/admin/spot-difference-games/${id}`, { method: 'DELETE' })
    await load()
  }

  if (loading) {
    return <p className="text-sm text-slate-400">در حال بارگذاری بازی‌های تفاوت...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-navy">بازی پیدا کردن تفاوت (مرحله‌ای)</h2>
        <p className="mt-1 text-xs text-slate-muted">
          ابتدا بازی را بسازید، سپس برای هر مرحله دو تصویر آپلود کنید و تفاوت‌ها را علامت بزنید.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submitGame} className="rounded-3xl bg-white p-5 shadow ring-1 ring-navy/10">
          <h3 className="font-extrabold text-navy">بازی جدید</h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className={labelCls}>عنوان</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
                placeholder="مثلاً: پیدا کردن تفاوت — پارک"
                required
              />
            </div>
            <div>
              <label className={labelCls}>شناسه (انگلیسی، بدون فاصله)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={`${inputCls} ltr`}
                placeholder="park-diff"
                required
              />
            </div>
            <div>
              <label className={labelCls}>توضیحات</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${inputCls} min-h-20`}
                placeholder="همه تفاوت‌ها را پیدا کن!"
              />
            </div>
          </div>
          <AdminButton type="submit" className="mt-4 w-full" disabled={saving}>
            {saving ? 'در حال ثبت...' : 'ثبت بازی'}
          </AdminButton>
        </form>

        <div className="grid gap-4">
          {games.length === 0 ? (
            <AdminPanel>
              <p className="text-sm text-slate-500">هنوز بازی ثبت نشده است.</p>
            </AdminPanel>
          ) : (
            games.map((game) => (
              <article key={game.id} className="rounded-3xl bg-white p-5 shadow ring-1 ring-navy/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-navy">{game.title}</h3>
                    <p className="mt-1 text-xs text-slate-muted ltr">{game.slug}</p>
                  </div>
                  <AdminBadge variant={game.isVisible ? 'success' : 'warning'}>
                    {game.isVisible ? 'فعال' : 'غیرفعال'}
                  </AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{game.description || '—'}</p>
                <p className="mt-2 text-xs font-bold text-violet-700">
                  {game.stageCount} مرحله — {game.spotCount} تفاوت علامت‌گذاری شده
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/dashboard/spot-difference/${game.id}`}>
                    <AdminButton type="button" variant="secondary" size="sm">
                      مدیریت مراحل
                    </AdminButton>
                  </Link>
                  <AdminButton type="button" variant="secondary" size="sm" onClick={() => toggleVisible(game)}>
                    {game.isVisible ? 'مخفی کردن' : 'نمایش در پنل والدین'}
                  </AdminButton>
                  <AdminButton type="button" variant="danger" size="sm" onClick={() => removeGame(game.id)}>
                    حذف
                  </AdminButton>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
