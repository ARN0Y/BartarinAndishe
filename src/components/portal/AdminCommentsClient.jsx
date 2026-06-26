'use client'

import { useEffect, useState } from 'react'

export default function AdminCommentsClient() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/comments')
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setComments(json.comments || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function toggleApprove(comment) {
    const newApproved = !comment.approved
    const res = await fetch(`/api/admin/comments/${comment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: newApproved }),
    })
    if (res.ok) load()
  }

  async function remove(id) {
    if (!confirm('این نظر حذف شود؟')) return
    const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  if (loading) return <p className="py-8 text-center text-sm text-slate-muted">در حال بارگذاری...</p>
  if (error) return <p className="rounded-2xl bg-red-100 px-5 py-3 text-sm font-bold text-red-700">{error}</p>
  if (comments.length === 0) return <p className="py-8 text-center text-sm text-slate-muted">هیچ نظری ثبت نشده است.</p>

  const pending = comments.filter((c) => !c.approved)
  const approved = comments.filter((c) => c.approved)

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-navy">
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
              در انتظار تأیید ({pending.length})
            </span>
          </h3>
          <div className="space-y-3">
            {pending.map((c) => (
              <CommentCard key={c.id} comment={c} onApprove={toggleApprove} onDelete={remove} />
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-navy">
            <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">
              تأییدشده ({approved.length})
            </span>
          </h3>
          <div className="space-y-3">
            {approved.map((c) => (
              <CommentCard key={c.id} comment={c} onApprove={toggleApprove} onDelete={remove} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function CommentCard({ comment, onApprove, onDelete }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-navy">{comment.name}</span>
            <span className="text-xs text-slate-muted">{comment.createdAtFormatted}</span>
            {comment.approved ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">تأییدشده</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">در انتظار</span>
            )}
          </div>
          <p className="mt-2 text-sm leading-7 text-navy-light">{comment.text}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onApprove(comment)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              comment.approved
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {comment.approved ? 'لغو تأیید' : 'تأیید'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200"
          >
            حذف
          </button>
        </div>
      </div>
    </article>
  )
}
