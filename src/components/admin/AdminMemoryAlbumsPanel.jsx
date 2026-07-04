'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { Plus, Trash2, Eye, EyeOff, Images, X, Pencil, Check } from 'lucide-react'

export default function AdminMemoryAlbumsPanel() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', year: '' })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', year: '' })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/memory-albums')
      const json = await res.json()
      setAlbums(json.albums || [])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function createAlbum(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.year.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/memory-albums', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setForm({ title: '', year: '' })
      await load()
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  async function patchAlbum(id, data) {
    const res = await fetch(`/api/admin/memory-albums/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.message || 'خطا'); return false }
    await load()
    return true
  }

  async function removeAlbum(id) {
    if (!window.confirm('این آلبوم و همهٔ عکس‌هایش حذف شود؟')) return
    const res = await fetch(`/api/admin/memory-albums/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('خطا در حذف'); return }
    await load()
  }

  async function addPhoto(albumId, imageUrl) {
    if (!imageUrl) return
    const res = await fetch(`/api/admin/memory-albums/${albumId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl }),
    })
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.message || 'خطا'); return }
    await load()
  }

  async function removePhoto(photoId) {
    const res = await fetch(`/api/admin/memory-photos/${photoId}`, { method: 'DELETE' })
    if (!res.ok) { alert('خطا'); return }
    await load()
  }

  async function savePhotoCaption(photoId, caption) {
    const res = await fetch(`/api/admin/memory-photos/${photoId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption }),
    })
    if (!res.ok) { alert('خطا در ذخیره زیرنویس'); return }
    setAlbums((prev) => prev.map((a) => ({
      ...a,
      photos: (a.photos || []).map((p) => (p.id === photoId ? { ...p, caption } : p)),
    })))
  }

  function startEdit(album) {
    setEditingId(album.id)
    setEditForm({ title: album.title, year: album.year })
  }
  async function saveEdit(id) {
    if (!editForm.title.trim() || !editForm.year.trim()) { alert('عنوان و سال الزامی است.'); return }
    const ok = await patchAlbum(id, { title: editForm.title.trim(), year: editForm.year.trim() })
    if (ok) setEditingId(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">آلبوم خاطرات سالانه</h3>
        <p className="mt-1 text-sm text-muted-foreground">برای هر سال یک آلبوم بسازید و عکس‌های آن سال را با زیرنویس اضافه کنید. عنوان، سال و زیرنویس هر عکس قابل ویرایش است. این بخش در صفحهٔ جداگانهٔ «آلبوم خاطرات سالانه» نمایش داده می‌شود.</p>
      </div>

      <AdminPanel>
        <form onSubmit={createAlbum} className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-medium">عنوان آلبوم</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} placeholder="مثلاً جشن پایان سال" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">سال</label>
            <input className={inputCls} value={form.year} onChange={(e) => setForm((v) => ({ ...v, year: e.target.value }))} placeholder="مثلاً ۱۴۰۴" />
          </div>
          <AdminButton type="submit" variant="primary" disabled={saving || !form.title.trim() || !form.year.trim()}>
            <Plus className="h-4 w-4" /> ساخت آلبوم
          </AdminButton>
        </form>
      </AdminPanel>

      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
      ) : albums.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">هنوز آلبومی ساخته نشده است.</p>
      ) : (
        <div className="space-y-4">
          {albums.map((album) => (
            <div key={album.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {editingId === album.id ? (
                  <div className="flex flex-1 flex-wrap items-end gap-2">
                    <div className="min-w-[160px] flex-1">
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">عنوان آلبوم</label>
                      <input className={inputCls} value={editForm.title} onChange={(e) => setEditForm((v) => ({ ...v, title: e.target.value }))} />
                    </div>
                    <div className="w-28">
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">سال</label>
                      <input className={inputCls} value={editForm.year} onChange={(e) => setEditForm((v) => ({ ...v, year: e.target.value }))} />
                    </div>
                    <AdminButton variant="primary" size="sm" onClick={() => saveEdit(album.id)}>ذخیره</AdminButton>
                    <AdminButton variant="secondary" size="sm" onClick={() => setEditingId(null)}>انصراف</AdminButton>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink/10 text-pink-deep"><Images className="h-5 w-5" /></span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{album.title}</p>
                        <p className="text-xs text-muted-foreground">سال {album.year} — {(album.photos?.length || 0).toLocaleString('fa-IR')} عکس</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEdit(album)} className="text-muted-foreground hover:text-foreground" title="ویرایش عنوان و سال"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => patchAlbum(album.id, { isVisible: !album.isVisible })} className={album.isVisible ? 'text-emerald-600' : 'text-muted-foreground'} title={album.isVisible ? 'نمایش' : 'مخفی'}>
                        {album.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button type="button" onClick={() => removeAlbum(album.id)} className="text-destructive" title="حذف آلبوم"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {(album.photos || []).map((ph) => (
                  <PhotoTile key={ph.id} photo={ph} onSaveCaption={savePhotoCaption} onRemove={() => removePhoto(ph.id)} />
                ))}
                <div className="flex h-24 items-center">
                  <AdminImageUpload label="" value="" folder="memories" onChange={(url) => addPhoto(album.id, url)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoTile({ photo, onSaveCaption, onRemove }) {
  const [caption, setCaption] = useState(photo.caption || '')
  useEffect(() => { setCaption(photo.caption || '') }, [photo.caption])
  const dirty = caption !== (photo.caption || '')

  return (
    <div className="w-28">
      <div className="group relative h-24 w-28 overflow-hidden rounded-lg ring-1 ring-border">
        <img src={photo.imageUrl} alt={photo.caption || ''} className="h-full w-full object-cover" />
        <button type="button" onClick={onRemove} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100" title="حذف عکس">
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <input
          className="h-7 w-full rounded border border-border bg-background px-1.5 text-[11px] outline-none focus:ring-1 focus:ring-ring"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => { if (dirty) onSaveCaption(photo.id, caption.trim()) }}
          placeholder="زیرنویس"
        />
        {dirty ? (
          <button type="button" onClick={() => onSaveCaption(photo.id, caption.trim())} className="shrink-0 text-emerald-600" title="ذخیره زیرنویس">
            <Check className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
