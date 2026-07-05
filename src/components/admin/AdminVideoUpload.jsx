'use client'

import { useRef, useState } from 'react'
import { Video, Loader2, X } from 'lucide-react'

/** آپلود ویدیو با بهینه‌سازی خودکار (فشرده‌سازی و تبدیل به MP4 روی سرور) */
export default function AdminVideoUpload({ value, onChange, label = 'ویدیو' }) {
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
      const res = await fetch('/api/admin/upload-video', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در آپلود ویدیو')
      onChange(json.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      {label ? <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p> : null}
      {value ? (
        <video src={value} controls playsInline className="mb-2 aspect-video w-full max-w-sm rounded-lg bg-black shadow-sm" />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> در حال بهینه‌سازی و آپلود...</>
          ) : (
            <><Video className="h-4 w-4" /> {value ? 'تغییر ویدیو' : 'آپلود ویدیو'}</>
          )}
        </button>
        {value ? (
          <button type="button" onClick={() => onChange('')} className="flex items-center gap-1 text-xs font-semibold text-destructive">
            <X className="h-3 w-3" /> حذف ویدیو
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        ویدیو پس از آپلود به‌صورت خودکار فشرده و به MP4 بهینه تبدیل می‌شود. مدت کوتاه و حجم کم توصیه می‌شود (حداکثر ۱۲۰ مگابایت).
      </p>
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      {error ? <p className="mt-1 text-xs font-bold text-destructive">{error}</p> : null}
    </div>
  )
}
