'use client'

import { useEffect, useRef, useState } from 'react'

const MAX_NAME = 40
const MAX_TEXT = 400

export default function CommentWidget() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('list') // 'list' | 'form'
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', msg }
  const panelRef = useRef(null)

  // بستن با Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // بارگذاری نظرات تأییدشده
  async function fetchComments() {
    setLoadingComments(true)
    try {
      const res = await fetch('/api/comments')
      const json = await res.json()
      setComments(json.comments || [])
    } catch {
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    setTab('list')
    fetchComments()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), text: text.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setFeedback({ type: 'success', msg: json.message })
      setName('')
      setText('')
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* دکمه شناور گوشه پایین-چپ */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="ثبت نظر"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-deep to-rose text-white shadow-xl shadow-pink-deep/30 transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223Z" clipRule="evenodd" />
        </svg>
      </button>

      {/* پنل نظرات */}
      {open && (
        <>
          {/* پس‌زمینه تاریک */}
          <div
            className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={panelRef}
            className="fixed bottom-24 left-4 z-50 flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-3xl bg-card shadow-2xl shadow-navy/20 ring-1 ring-navy/10"
            role="dialog"
            aria-modal="true"
            aria-label="پنل نظرات"
          >
            {/* هدر */}
            <div className="flex items-center justify-between bg-gradient-to-l from-pink-deep to-rose px-5 py-4">
              <h2 className="text-base font-extrabold text-white">نظرات بازدیدکنندگان</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/80 transition hover:text-white"
                aria-label="بستن"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* تب‌ها */}
            <div className="flex gap-1 border-b border-navy/8 px-4 pt-3">
              <button
                type="button"
                onClick={() => { setTab('list'); fetchComments() }}
                className={`rounded-t-xl px-4 py-2 text-sm font-bold transition ${tab === 'list' ? 'bg-pink-soft text-pink-deep' : 'text-muted-foreground hover:text-foreground'}`}
              >
                مشاهده نظرات
              </button>
              <button
                type="button"
                onClick={() => { setTab('form'); setFeedback(null) }}
                className={`rounded-t-xl px-4 py-2 text-sm font-bold transition ${tab === 'form' ? 'bg-pink-soft text-pink-deep' : 'text-muted-foreground hover:text-foreground'}`}
              >
                ثبت نظر
              </button>
            </div>

            {/* محتوا */}
            <div className="max-h-80 overflow-y-auto p-4">
              {tab === 'list' ? (
                loadingComments ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
                ) : comments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">هنوز نظری ثبت نشده است.</p>
                ) : (
                  <ul className="space-y-3">
                    {comments.map((c) => (
                      <li key={c.id} className="rounded-2xl bg-pink-soft/50 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.createdAtFormatted}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-7 text-navy-light">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                feedback?.type === 'success' ? (
                  <div className="py-6 text-center">
                    <svg className="mx-auto h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">{feedback.msg}</p>
                    <button
                      type="button"
                      onClick={() => { setFeedback(null) }}
                      className="mt-4 rounded-xl bg-pink-soft px-4 py-2 text-sm font-bold text-pink-deep"
                    >
                      ثبت نظر جدید
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">
                        نام شما <span className="text-muted-foreground font-normal">(حداکثر {MAX_NAME} کاراکتر)</span>
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
                        className="w-full rounded-2xl border border-pink/30 px-3 py-2.5 text-sm outline-none focus:border-pink-deep"
                        placeholder="نام خود را وارد کنید"
                        required
                        minLength={2}
                        maxLength={MAX_NAME}
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center justify-between text-xs font-bold text-foreground">
                        <span>متن نظر</span>
                        <span className="font-normal text-muted-foreground">{text.length} / {MAX_TEXT}</span>
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
                        className="min-h-[100px] w-full rounded-2xl border border-pink/30 px-3 py-2.5 text-sm outline-none focus:border-pink-deep"
                        placeholder="نظر خود را بنویسید..."
                        required
                        minLength={5}
                        maxLength={MAX_TEXT}
                      />
                    </div>
                    {feedback?.type === 'error' && (
                      <p className="text-xs font-medium text-red-600">{feedback.msg}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-2xl bg-gradient-to-l from-pink-deep to-rose py-2.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
                    >
                      {submitting ? 'در حال ارسال...' : 'ثبت نظر'}
                    </button>
                  </form>
                )
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
