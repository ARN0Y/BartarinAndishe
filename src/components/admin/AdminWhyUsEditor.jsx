'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import AdminVideoUpload from '@/components/admin/AdminVideoUpload'
import { cn } from '@/lib/utils'
import { Save, Plus, X, ChevronDown, Sparkles } from 'lucide-react'

function MediaStrip({ items, onChange }) {
  const list = items || []
  function update(i, patch) { onChange(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it))) }
  function remove(i) { onChange(list.filter((_, idx) => idx !== i)) }
  function add() { onChange([...list, { id: `new-${Date.now()}`, type: 'image', src: '', caption: '' }]) }

  return (
    <div className="space-y-3">
      {list.map((it, i) => (
        <div key={it.id || i} className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                  value={it.type === 'video' ? 'video' : 'image'}
                  onChange={(e) => update(i, { type: e.target.value })}
                >
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                </select>
                <span className="text-[11px] text-muted-foreground">مورد {i + 1}</span>
              </div>
              {it.type === 'video' ? (
                <>
                  <AdminVideoUpload label="ویدیو" value={it.src || ''} onChange={(url) => update(i, { src: url })} />
                  <AdminImageUpload label="تصویر پوستر (اختیاری)" value={it.poster || ''} folder="cms" onChange={(url) => update(i, { poster: url })} />
                </>
              ) : (
                <AdminImageUpload label="" value={it.src || ''} folder="cms" onChange={(url) => update(i, { src: url })} />
              )}
              <input className={inputCls} value={it.caption || ''} onChange={(e) => update(i, { caption: e.target.value })} placeholder="زیرنویس (اختیاری)" />
            </div>
            <button type="button" onClick={() => remove(i)} className="shrink-0 text-destructive" title="حذف"><X className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      <AdminButton variant="secondary" size="sm" onClick={add}><Plus className="h-3.5 w-3.5" /> افزودن تصویر/ویدیو</AdminButton>
    </div>
  )
}

export default function AdminWhyUsEditor() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [openId, setOpenId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/why-us')
      const json = await res.json()
      setTopics(json.topics || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function updateTopic(id, patch) {
    setTopics((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  async function save() {
    setSaving(true); setDone(false)
    try {
      const res = await fetch('/api/admin/why-us', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topics }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setTopics(json.topics || [])
      setDone(true); setTimeout(() => setDone(false), 2500)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  if (loading) return <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground"><Sparkles className="h-4 w-4" /> چرا برترین اندیشه؟ (۵ اسلاید)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          روی هر عنوان کلیک کنید تا متن و عکس‌ها/ویدیوهای آن را ویرایش، اضافه یا حذف کنید. این اسلایدها کنار هم در صفحهٔ اصلی نمایش داده می‌شوند و با کلیک روی هرکدام، صفحهٔ اختصاصی آن باز می‌شود.
        </p>
      </div>

      <div className="space-y-2">
        {topics.map((t) => {
          const open = openId === t.id
          return (
            <div key={t.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <button type="button" onClick={() => setOpenId(open ? null : t.id)} className="flex w-full items-center gap-2 px-3 py-3 text-right" aria-expanded={open}>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{t.title || 'بدون عنوان'}</span>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{(t.media?.length || 0).toLocaleString('fa-IR')} رسانه</span>
              </button>
              {open ? (
                <div className="space-y-3 border-t border-border p-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">عنوان</label>
                    <input className={inputCls} value={t.title || ''} onChange={(e) => updateTopic(t.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">متن</label>
                    <textarea className={`${inputCls} h-28 py-2`} value={t.body || ''} onChange={(e) => updateTopic(t.id, { body: e.target.value })} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold text-foreground">عکس‌ها و ویدیوها</p>
                    <MediaStrip items={t.media} onChange={(media) => updateTopic(t.id, { media })} />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <AdminButton variant="primary" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره چرا برترین اندیشه'}</AdminButton>
        {done ? <span className="text-sm font-bold text-emerald-600">✓ ذخیره شد</span> : null}
      </div>
    </div>
  )
}
