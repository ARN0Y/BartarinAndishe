'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'

/** آپلود تصویر برای ماژول‌های محتوا — مقدار = URL ذخیره‌شده */
export default function AdminImageUpload({ value, onChange, folder = 'cms', label = 'تصویر', className = '' }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در آپلود')
      onChange(json.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary/50"
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-6 w-6" strokeWidth={1.6} />
          )}
        </button>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {uploading ? 'در حال آپلود...' : value ? 'تغییر تصویر' : 'انتخاب تصویر'}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1 text-xs font-semibold text-destructive"
            >
              <X className="h-3 w-3" /> حذف تصویر
            </button>
          ) : null}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      {error ? <p className="mt-1 text-xs font-bold text-destructive">{error}</p> : null}
    </div>
  )
}
