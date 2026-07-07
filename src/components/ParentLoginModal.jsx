'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import NationalIdPinInput from '@/components/ui/NationalIdPinInput'

const LS_KEY = 'bartarin_saved_nid'

export default function ParentLoginModal({ onClose }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleForgot() {
    setError(''); setNotice('')
    if (nationalId.length !== 10) {
      setError('برای بازنشانی رمز، ابتدا کد ملی ۱۰ رقمی نوآموز را وارد کنید.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/parent/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nationalId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'خطا در بازنشانی رمز')
      setPassword('')
      setNotice(data.message || 'رمز به کد ملی نوآموز بازنشانی شد.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    // کد ملی آخرین ورود را به‌خاطر می‌سپاریم تا والدین فقط رمز را وارد کنند.
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved && /^\d{10}$/.test(saved)) setNationalId(saved)
    } catch {}
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (nationalId.length !== 10) {
      setError('کد ملی ۱۰ رقمی نوآموز را کامل وارد کنید، سپس رمز عبور را بزنید.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, password: password || nationalId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'خطا در ورود')
      try { localStorage.setItem(LS_KEY, nationalId) } catch {}
      onClose()
      router.push('/payment/parent/dashboard?tab=profile')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-login-title"
        className="relative z-[201] w-full max-w-md overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl"
      >
        <div className="border-b border-border bg-card px-6 py-5 text-center">
          <img src="/images/logo.svg" alt="" className="mx-auto h-14 w-auto" />
          <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-pink-deep">کودکستان برترین اندیشه</p>
          <h2 id="parent-login-title" className="mt-1 text-xl font-extrabold text-foreground">ورود اولیا</h2>
          <p className="mt-2 text-xs text-muted-foreground">کد ملی ۱۰ رقمی نوآموز را وارد کنید</p>
        </div>

        <form onSubmit={submit} className="px-6 py-6">
          <NationalIdPinInput
            value={nationalId}
            onChange={setNationalId}
            disabled={loading}
            autoFocus
          />

          <div className="mt-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              dir="ltr"
              placeholder="رمز عبور (بار اول: کد ملی)"
              autoComplete="current-password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-center text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">ورود اول: رمز همان کد ملی نوآموز است.</p>
              <button type="button" onClick={handleForgot} disabled={loading} className="text-[11px] font-bold text-pink-deep hover:underline disabled:opacity-50">
                فراموشی رمز؟
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
              {notice}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-pink-deep py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose disabled:opacity-50"
          >
            {loading ? 'در حال ورود...' : 'ورود به پنل اولیا'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-lg border border-border py-2.5 text-xs font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            انصراف
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
