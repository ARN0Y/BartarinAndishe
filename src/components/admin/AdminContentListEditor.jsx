'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react'

const EMPTY = { title: '', body: '', mediaType: 'article', mediaUrl: '', linkUrl: '', isVisible: true }

export default function AdminContentListEditor({ section, title, description, allowVideo = true }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content?section=${section}`)
      const json = await res.json()
      setItems(json.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [section])

  async function create(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content?section=${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setForm(EMPTY)
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function patch(id, data) {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) { alert(json.message || 'خطا'); return }
    await load()
  }

  async function remove(id) {
    if (!window.confirm('این مورد حذف شود؟')) return
    const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('خطا در حذف'); return }
    await load()
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>

      {/* فرم افزودن */}
      <AdminPanel>
        <form onSubmit={create} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">عنوان</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} placeholder="عنوان" />
            </div>
            {allowVideo ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium">نوع</label>
                <select className={inputCls} value={form.mediaType} onChange={(e) => setForm((v) => ({ ...v, mediaType: e.target.value }))}>
                  <option value="article">مقاله / متن</option>
                  <option value="video">ویدیو</option>
                </select>
              </div>
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">متن / توضیح</label>
            <textarea className={`${inputCls} h-24 py-2`} value={form.body} onChange={(e) => setForm((v) => ({ ...v, body: e.target.value }))} placeholder="متن مقاله یا توضیح کوتاه" />
          </div>
          {allowVideo && form.mediaType === 'video' ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium">نشانی ویدیو (URL)</label>
              <input className={inputCls + ' ltr text-left'} value={form.mediaUrl} onChange={(e) => setForm((v) => ({ ...v, mediaUrl: e.target.value }))} placeholder="/videos/sample.mp4 یا لینک کامل" />
            </div>
          ) : (
            <AdminImageUpload label="تصویر (اختیاری)" value={form.mediaUrl} folder="cms" onChange={(url) => setForm((v) => ({ ...v, mediaUrl: url, mediaType: v.mediaType === 'video' ? v.mediaType : 'image' }))} />
          )}
          <AdminButton type="submit" variant="primary" disabled={saving || !form.title.trim()}>
            <Plus className="h-4 w-4" /> افزودن
          </AdminButton>
        </form>
      </AdminPanel>

      {/* فهرست موارد */}
      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">موردی ثبت نشده است.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <ItemRow key={it.id} item={it} onSave={patch} onRemove={remove} allowVideo={allowVideo} />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, onSave, onRemove, allowVideo }) {
  const [draft, setDraft] = useState(item)
  useEffect(() => setDraft(item), [item])
  const dirty = JSON.stringify(draft) !== JSON.stringify(item)

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {draft.mediaUrl && draft.mediaType !== 'video' ? (
          <img src={draft.mediaUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-border" />
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <input className={inputCls} value={draft.title} onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))} />
          <textarea className={`${inputCls} h-20 py-2`} value={draft.body || ''} onChange={(e) => setDraft((v) => ({ ...v, body: e.target.value }))} />
          {allowVideo && draft.mediaType === 'video' ? (
            <input className={inputCls + ' ltr text-left'} value={draft.mediaUrl || ''} onChange={(e) => setDraft((v) => ({ ...v, mediaUrl: e.target.value }))} placeholder="نشانی ویدیو" />
          ) : (
            <AdminImageUpload label="تصویر" value={draft.mediaUrl} folder="cms" onChange={(url) => setDraft((v) => ({ ...v, mediaUrl: url }))} />
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button type="button" onClick={() => onSave(item.id, { isVisible: !item.isVisible })} title={item.isVisible ? 'نمایش داده می‌شود' : 'مخفی است'} className={item.isVisible ? 'text-emerald-600' : 'text-muted-foreground'}>
            {item.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
          <button type="button" onClick={() => onRemove(item.id)} className="text-destructive" title="حذف">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {dirty ? (
        <div className="mt-3 flex justify-end">
          <AdminButton variant="primary" size="sm" onClick={() => onSave(item.id, { title: draft.title, body: draft.body, mediaUrl: draft.mediaUrl, mediaType: draft.mediaType })}>
            <Save className="h-3.5 w-3.5" /> ذخیره
          </AdminButton>
        </div>
      ) : null}
    </div>
  )
}
