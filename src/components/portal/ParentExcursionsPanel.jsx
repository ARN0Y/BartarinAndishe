'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tent, CheckCircle2, ShieldCheck, CreditCard, Loader2, Upload, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

function rialToToman(rial) {
  return new Intl.NumberFormat('fa-IR').format(Math.floor((Number(rial) || 0) / 10))
}

export default function ParentExcursionsPanel() {
  const [excursions, setExcursions] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentMsg, setPaymentMsg] = useState(null) // { ok, text }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/parent/excursions')
      const json = await res.json()
      setExcursions(json.excursions || [])
    } catch { setExcursions([]) } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'success') setPaymentMsg({ ok: true, text: 'پرداخت هزینهٔ اردو با موفقیت انجام شد.' })
    else if (p === 'failed') setPaymentMsg({ ok: false, text: 'پرداخت ناموفق بود یا لغو شد. می‌توانید دوباره تلاش کنید.' })
    else if (p === 'missing') setPaymentMsg({ ok: false, text: 'اطلاعات پرداخت ناقص بود.' })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> در حال بارگذاری اردوها...</div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Tent className="h-5 w-5" /> اردوها</h2>
        <p className="mt-1 text-sm text-muted-foreground">رضایت‌نامهٔ هر اردو را با امضای الکترونیکی و تایید پیامکی تکمیل و هزینه را پرداخت کنید.</p>
      </div>

      {paymentMsg ? (
        <div className={cn('rounded-lg border px-4 py-3 text-sm font-semibold', paymentMsg.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200')}>
          {paymentMsg.text}
        </div>
      ) : null}

      {excursions.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <Tent className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-bold text-foreground">در حال حاضر اردوی فعالی وجود ندارد</p>
            <p className="mt-1 text-xs text-muted-foreground">هر اردوی جدیدی که تعریف شود، اینجا نمایش داده می‌شود.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {excursions.map((ex) => <ExcursionCard key={ex.id} excursion={ex} onChanged={load} />)}
        </div>
      )}
    </div>
  )
}

function ExcursionCard({ excursion, onChanged }) {
  const st = excursion.status || {}
  const [step, setStep] = useState('view') // view | consent | otp | pay
  const [signerRole, setSignerRole] = useState(st.signerRole || 'father')
  const [phone, setPhone] = useState(st.phone ? st.phone.replace(/^0/, '') : '')
  const [accepted, setAccepted] = useState(false)
  const [sigUrl, setSigUrl] = useState(st.parentSignatureUrl || '')
  const [uploading, setUploading] = useState(false)
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const completed = st.completed

  async function uploadSignature(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setUploading(true)
    try {
      const fd = new FormData(); fd.append('signature', file)
      const res = await fetch(`/api/parent/excursions/${excursion.id}/signature`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در آپلود امضا')
      setSigUrl(json.parentSignatureUrl)
    } catch (err) { setError(err.message) } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function submitConsent() {
    setError('')
    if (!accepted) { setError('لطفاً متن رضایت‌نامه را بپذیرید.'); return }
    if (!sigUrl) { setError('لطفاً امضای الکترونیکی خود را بارگذاری کنید.'); return }
    if (!/^9\d{9}$/.test(phone)) { setError('شمارهٔ موبایل را بدون صفر و ۱۰ رقمی وارد کنید (مثال: 912...).'); return }
    setBusy(true)
    try {
      const res = await fetch(`/api/parent/excursions/${excursion.id}/sign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerRole, parentSignatureUrl: sigUrl, consentAccepted: true, phone: '0' + phone }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در ثبت رضایت‌نامه')
      setDevCode(json.devCode || '')
      setStep('otp')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function verifyOtp() {
    setError('')
    if (!/^\d{6}$/.test(code.replace(/\D/g, ''))) { setError('کد تایید ۶ رقمی را وارد کنید.'); return }
    setBusy(true)
    try {
      const res = await fetch(`/api/parent/excursions/${excursion.id}/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code.replace(/\D/g, '') }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'کد نادرست است')
      await onChanged()
      setStep('pay')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function pay() {
    setError(''); setBusy(true)
    try {
      const res = await fetch(`/api/parent/excursions/${excursion.id}/pay`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در شروع پرداخت')
      if (json.alreadyPaid) { await onChanged(); return }
      if (json.paymentUrl) window.location.href = json.paymentUrl
    } catch (err) { setError(err.message); setBusy(false) }
  }

  // وضعیت خلاصه برای نمایش دکمهٔ اصلی
  const needsSign = !st.signed
  const needsOtp = st.signed && !st.otpVerified
  const needsPay = st.otpVerified && !st.paid

  return (
    <Card className={cn('rounded-xl', completed && 'border-emerald-200 dark:border-emerald-900/60')}>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink/10 text-pink-deep"><Tent className="h-5 w-5" /></span>
            <div>
              <p className="text-base font-bold text-foreground">{excursion.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">هزینه: <span className="font-bold text-foreground">{rialToToman(excursion.costRial)} تومان</span></p>
            </div>
          </div>
          {completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> رضایت‌نامه و پرداخت تکمیل شد
            </span>
          ) : (
            <StepIndicator signed={st.signed} otp={st.otpVerified} paid={st.paid} />
          )}
        </div>

        {excursion.description ? (
          <p className="mt-3 whitespace-pre-line rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-7 text-muted-foreground">{excursion.description}</p>
        ) : null}

        {error ? <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{error}</p> : null}

        {!completed ? (
          <div className="mt-4">
            {/* گام امضا */}
            {(step === 'consent' || (step === 'view' && needsSign)) ? (
              step === 'consent' ? (
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-sm font-bold text-foreground">امضای رضایت‌نامه</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">امضاکننده</label>
                      <select value={signerRole} onChange={(e) => setSignerRole(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                        <option value="father">پدر</option>
                        <option value="mother">مادر</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">موبایل (برای کد تایید — بدون صفر)</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} dir="ltr" inputMode="numeric" placeholder="912xxxxxxx" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-center text-sm ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">امضای الکترونیکی (تصویر امضا)</label>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {sigUrl ? 'تغییر امضا' : 'بارگذاری امضا'}
                      </Button>
                      {sigUrl ? <img src={sigUrl} alt="امضا" className="h-12 w-auto rounded border border-border bg-white object-contain" /> : <span className="text-xs text-muted-foreground">تصویری از امضای خود بارگذاری کنید</span>}
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadSignature} />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 text-xs text-foreground">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
                    متن رضایت‌نامهٔ فوق را مطالعه کردم و با شرکت فرزندم در این اردو و پرداخت هزینهٔ آن موافقم.
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" disabled={busy} onClick={submitConsent} className="bg-pink-deep hover:bg-rose text-white">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} ثبت و دریافت کد تایید
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setStep('view')}>انصراف</Button>
                  </div>
                </div>
              ) : (
                <Button type="button" size="sm" onClick={() => { setStep('consent'); setAccepted(false) }} className="bg-pink-deep hover:bg-rose text-white">
                  <ShieldCheck className="h-4 w-4" /> مطالعه و امضای رضایت‌نامه
                </Button>
              )
            ) : null}

            {/* گام کد تایید */}
            {(step === 'otp' || (step === 'view' && needsOtp)) ? (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <p className="text-sm font-bold text-foreground">کد تایید پیامکی</p>
                {devCode ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
                    درگاه پیامک هنوز پیکربندی نشده — کد تست: <span className="font-mono text-sm">{devCode}</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">کد ۶ رقمی ارسال‌شده به موبایل را وارد کنید.</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} dir="ltr" inputMode="numeric" placeholder="------" className="h-10 w-32 rounded-lg border border-input bg-background px-3 text-center text-lg font-bold tracking-widest ltr" />
                  <Button type="button" size="sm" disabled={busy} onClick={verifyOtp} className="bg-pink-deep hover:bg-rose text-white">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} تایید کد
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => { setStep('consent') }}>
                    <RefreshCw className="h-3.5 w-3.5" /> ارسال دوباره
                  </Button>
                </div>
              </div>
            ) : null}

            {/* گام پرداخت */}
            {(step === 'pay' || (step === 'view' && needsPay)) ? (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <p className="text-sm font-bold text-foreground">پرداخت هزینهٔ اردو</p>
                <p className="text-xs text-muted-foreground">رضایت‌نامه تایید شد. برای تکمیل، هزینهٔ اردو ({rialToToman(excursion.costRial)} تومان) را پرداخت کنید.</p>
                <Button type="button" disabled={busy} onClick={pay} className="bg-pink-deep hover:bg-rose text-white">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} پرداخت آنلاین هزینهٔ اردو
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function StepIndicator({ signed, otp, paid }) {
  const steps = [
    { label: 'امضا', done: signed },
    { label: 'تایید', done: otp },
    { label: 'پرداخت', done: paid },
  ]
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s) => (
        <span key={s.label} className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold', s.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground')}>
          {s.done ? '✓' : '○'} {s.label}
        </span>
      ))}
    </div>
  )
}
