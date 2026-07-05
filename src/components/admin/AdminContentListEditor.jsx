'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import AdminVideoUpload from '@/components/admin/AdminVideoUpload'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Eye, EyeOff, Save, ChevronDown, FileText, Video } from 'lucide-react'

const EMPTY = { title: '', body: '', mediaType: 'article', mediaUrl: '', linkUrl: '', isVisible: true }

export default function AdminContentListEditor({ section, title, description, allowVideo = true }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [openId, setOpenId] = useState(null)

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

      {/* فرم افزودن موضوع جدید */}
      <AdminPanel>
        <form onSubmit={create} className="space-y-3">
          <p className="text-sm font-bold text-foreground">افزودن موضوع جدید</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">عنوان</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} placeholder="عنوان موضوع" />
            </div>
            {allowVideo ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium">نوع</label>
                <select className={inputCls} value={form.mediaType} onChange={(e) => setForm((v) => ({ ...v, mediaType: e.target.value, mediaUrl: '' }))}>
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
            <AdminVideoUpload label="ویدیو" value={form.mediaUrl} onChange={(url) => setForm((v) => ({ ...v, mediaUrl: url }))} />
          ) : (
            <AdminImageUpload label="تصویر (اختیاری)" value={form.mediaUrl} folder="cms" onChange={(url) => setForm((v) => ({ ...v, mediaUrl: url, mediaType: v.mediaType === 'video' ? v.mediaType : 'image' }))} />
          )}
          <AdminButton type="submit" variant="primary" disabled={saving || !form.title.trim()}>
            <Plus className="h-4 w-4" /> افزودن
          </AdminButton>
        </form>
      </AdminPanel>

      {/* فهرست موضوعات — فقط عنوان‌ها؛ با کلیک باز و قابل ویرایش می‌شوند */}
      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">موضوعی ثبت نشده است.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <ItemRow
              key={it.id}
              item={it}
              open={openId === it.id}
              onToggle={() => setOpenId((cur) => (cur === it.id ? null : it.id))}
              onSave={patch}
              onRemove={remove}
              allowVideo={allowVideo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, open, onToggle, onSave, onRemove, allowVideo }) {
  const [draft, setDraft] = useState(item)
  useEffect(() => setDraft(item), [item])
  const dirty = JSON.stringify(draft) !== JSON.stringify(item)
  const isVideo = draft.mediaType === 'video'

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* هدر: فقط عنوان + وضعیت */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-right" aria-expanded={open}>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', isVideo ? 'bg-rose/10 text-rose' : 'bg-pink/10 text-pink-deep')}>
            {isVideo ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          </span>
          <span className="truncate text-sm font-bold text-foreground">{item.title || 'بدون عنوان'}</span>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{isVideo ? 'ویدیو' : 'مقاله'}</span>
        </button>
        <button type="button" onClick={() => onSave(item.id, { isVisible: !item.isVisible })} title={item.isVisible ? 'نمایش داده می‌شود' : 'مخفی است'} className={item.isVisible ? 'text-emerald-600' : 'text-muted-foreground'}>
          {item.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
        <button type="button" onClick={() => onRemove(item.id)} className="text-destructive" title="حذف">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* بدنه: با کلیک باز و قابل ویرایش */}
      {open ? (
        <div className="space-y-3 border-t border-border p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">عنوان</label>
            <input className={inputCls} value={draft.title} onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))} />
          </div>
          {allowVideo ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">نوع</label>
              <select className={inputCls} value={draft.mediaType || 'article'} onChange={(e) => setDraft((v) => ({ ...v, mediaType: e.target.value, mediaUrl: '' }))}>
                <option value="article">مقاله / متن</option>
                <option value="image">مقاله + تصویر</option>
                <option value="video">ویدیو</option>
              </select>
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">متن / توضیح</label>
            <textarea className={`${inputCls} h-24 py-2`} value={draft.body || ''} onChange={(e) => setDraft((v) => ({ ...v, body: e.target.value }))} />
          </div>
          {isVideo ? (
            <AdminVideoUpload label="ویدیو" value={draft.mediaUrl} onChange={(url) => setDraft((v) => ({ ...v, mediaUrl: url }))} />
          ) : (
            <AdminImageUpload label="تصویر" value={draft.mediaUrl} folder="cms" onChange={(url) => setDraft((v) => ({ ...v, mediaUrl: url }))} />
          )}
          <div className="flex justify-end">
            <AdminButton variant="primary" size="sm" disabled={!dirty} onClick={() => onSave(item.id, { title: draft.title, body: draft.body, mediaUrl: draft.mediaUrl, mediaType: draft.mediaType })}>
              <Save className="h-3.5 w-3.5" /> ذخیره تغییرات
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
