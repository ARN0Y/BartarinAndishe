'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { Plus, Trash2, Eye, EyeOff, Images, X } from 'lucide-react'

export default function AdminMemoryAlbumsPanel() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', year: '', coverUrl: '' })
  const [saving, setSaving] = useState(false)

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
      setForm({ title: '', year: '', coverUrl: '' })
      await load()
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  async function patchAlbum(id, data) {
    const res = await fetch(`/api/admin/memory-albums/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.message || 'خطا'); return }
    await load()
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

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">آلبوم خاطرات سالانه</h3>
        <p className="mt-1 text-sm text-muted-foreground">برای هر سال یک آلبوم بسازید و عکس‌های آن سال را اضافه کنید.</p>
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
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink/10 text-pink-deep"><Images className="h-5 w-5" /></span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{album.title}</p>
                    <p className="text-xs text-muted-foreground">سال {album.year} — {(album.photos?.length || 0).toLocaleString('fa-IR')} عکس</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => patchAlbum(album.id, { isVisible: !album.isVisible })} className={album.isVisible ? 'text-emerald-600' : 'text-muted-foreground'} title={album.isVisible ? 'نمایش' : 'مخفی'}>
                    {album.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button type="button" onClick={() => removeAlbum(album.id)} className="text-destructive" title="حذف آلبوم"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(album.photos || []).map((ph) => (
                  <div key={ph.id} className="group relative h-20 w-20 overflow-hidden rounded-lg ring-1 ring-border">
                    <img src={ph.imageUrl} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(ph.id)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100" title="حذف عکس">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <AddPhotoTile albumId={album.id} onAdd={addPhoto} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddPhotoTile({ albumId, onAdd }) {
  // از AdminImageUpload استفاده می‌کنیم: پس از آپلود، بلافاصله عکس به آلبوم اضافه می‌شود
  return (
    <div className="flex h-20 items-center">
      <AdminImageUpload label="" value="" folder="memories" onChange={(url) => onAdd(albumId, url)} />
    </div>
  )
}
