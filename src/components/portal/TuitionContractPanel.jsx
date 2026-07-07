'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { onlyEnglishDigits } from '@/lib/digits'
import TuitionContractDocument from './TuitionContractDocument'

function maskPhone(p) {
  const s = String(p || '')
  if (s.length < 8) return s
  return `${s.slice(0, 4)}***${s.slice(-4)}`
}

export default function TuitionContractPanel({ profileCompleted, onSigned }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(false)
  const [signedAt, setSignedAt] = useState(null)
  const [signerRole, setSignerRole] = useState('father')
  const [workshopConsent, setWorkshopConsent] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [amanatCommitmentAccepted, setAmanatCommitmentAccepted] = useState(false)
  const [fields, setFields] = useState(null)
  const [signerOptions, setSignerOptions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [parentSignatureUrl, setParentSignatureUrl] = useState('')
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpPhone, setOtpPhone] = useState('')
  const [otpNote, setOtpNote] = useState('')
  const [settingsConfigured, setSettingsConfigured] = useState(true)
  const [financialPlanReady, setFinancialPlanReady] = useState(false)

  const load = useCallback(async (role, initial = false) => {
    if (initial) setLoading(true)
    setError('')
    try {
      const query = role && !signed ? `?signerRole=${role}` : ''
      const res = await fetch(`/api/parent/contract${query}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در بارگذاری قرارداد')

      const isSigned = Boolean(json.signed)
      setSigned(isSigned)
      setSignerOptions(json.signerOptions || [])
      setSettingsConfigured(json.contractSettingsConfigured !== false)
      setFinancialPlanReady(json.financialPlanReady === true)

      if (isSigned && json.contract) {
        const snapshot = json.contract.snapshot || json.fields
        setFields(snapshot)
        setSignerRole(json.contract.signerRole)
        setWorkshopConsent(json.contract.workshopConsent)
        setContractAccepted(json.contract.contractAccepted)
        setAmanatCommitmentAccepted(Boolean(snapshot?.amanatCommitmentAccepted))
        setSignedAt(json.contract.signedAt)
        setParentSignatureUrl(json.contract.parentSignatureUrl || snapshot?.parentSignatureUrl || '')
      } else {
        setFields(json.fields)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      if (initial) setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    load('father', true)
  }, [load])

  useEffect(() => {
    if (!signed) load(signerRole, false)
  }, [signerRole, signed, load])

  useEffect(() => {
    if (!signed) {
      setParentSignatureUrl('')
      setOtpSent(false)
      setOtpCode('')
      setOtpPhone('')
      setOtpNote('')
    }
  }, [signerRole, signed])

  const displayFields = useMemo(() => {
    if (!fields) return null
    if (signed) return fields
    return { ...fields, parentSignatureUrl: parentSignatureUrl || fields.parentSignatureUrl || '' }
  }, [fields, parentSignatureUrl, signed])

  const canPrint = signed

  useEffect(() => {
    const el = document.getElementById('contract-print-root')
    if (!el) return
    if (canPrint) el.classList.add('contract-print-ready')
    else el.classList.remove('contract-print-ready')
  }, [canPrint])

  useEffect(() => {
    function blockPrint(e) {
      if (!signed) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('beforeprint', blockPrint)
    return () => window.removeEventListener('beforeprint', blockPrint)
  }, [signed])

  function handlePrint() {
    if (!canPrint) return
    window.print()
  }

  async function uploadSignature(file) {
    setUploadingSignature(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('signature', file)
      const res = await fetch('/api/parent/contract/signature', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در آپلود امضا')
      setParentSignatureUrl(json.parentSignatureUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingSignature(false)
    }
  }

  function validateBeforeSign() {
    if (!parentSignatureUrl) return 'لطفاً تصویر امضا را بارگذاری کنید.'
    if (!workshopConsent || !contractAccepted) return 'پذیرش هر دو مورد پایین قرارداد الزامی است.'
    if (displayFields?.hasAmanatChecks && !amanatCommitmentAccepted) {
      return 'پذیرش تعهد پرداخت نقدی چک(های) امانت الزامی است.'
    }
    return ''
  }

  async function sendOtp() {
    const validationError = validateBeforeSign()
    if (validationError) {
      setError(validationError)
      return
    }
    setSendingOtp(true)
    setError('')
    setOtpNote('')
    try {
      const res = await fetch('/api/parent/contract/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerRole }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در ارسال کد تایید')
      setOtpSent(true)
      setOtpCode('')
      setOtpPhone(json.phone || '')
      if (json.devCode) {
        setOtpNote(`کد تست (فقط در محیط توسعه): ${json.devCode}`)
      } else if (!json.otpSent) {
        setOtpNote('ارسال پیامک ممکن است با تأخیر انجام شود؛ اگر کد نرسید، «ارسال مجدد کد» را بزنید.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleSign(e) {
    e.preventDefault()
    const validationError = validateBeforeSign()
    if (validationError) {
      setError(validationError)
      return
    }
    if (!otpCode.trim()) {
      setError('کد تایید پیامکی را وارد کنید.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/parent/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerRole,
          workshopConsent,
          contractAccepted,
          amanatCommitmentAccepted,
          parentSignatureUrl,
          otpCode: otpCode.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در ثبت قرارداد')
      const snapshot = json.contract.snapshot
      setSigned(true)
      setFields(snapshot)
      setSignedAt(json.contract.signedAt)
      setParentSignatureUrl(json.contract.parentSignatureUrl || '')
      onSigned?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!profileCompleted) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow ring-1 ring-amber-100">
        <p className="text-3xl mb-3">📋</p>
        <h2 className="text-lg font-extrabold text-navy">قرارداد شهریه</h2>
        <p className="mt-3 text-sm leading-7 text-slate-muted">
          برای مشاهده و امضای قرارداد، ابتدا باید «فرم تکمیل اطلاعات نوآموز» را کامل کنید.
        </p>
      </div>
    )
  }

  if (loading && !fields) {
    return <p className="py-10 text-center text-sm text-slate-muted">در حال بارگذاری قرارداد...</p>
  }

  if (error && !fields) {
    return <p className="py-10 text-center text-sm text-red-600">{error}</p>
  }

  return (
    <div className="space-y-5">
      <div className="no-print">
        <h2 className="text-lg font-extrabold text-navy">قرارداد شهریه</h2>
        <p className="mt-1 text-xs text-slate-muted">
          {signed
            ? 'نسخه ثبت‌شده قرارداد — قابل چاپ و غیرقابل ویرایش.'
            : 'ابتدا امضاکننده را انتخاب کنید، متن قرارداد را بخوانید، سپس امضا و تأیید نهایی را انجام دهید.'}
        </p>
      </div>

      {!settingsConfigured && !signed && (
        <div className="no-print rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          مبلغ شهریه برای این سال تحصیلی هنوز توسط مدیریت تعریف نشده است.
        </div>
      )}

      {!financialPlanReady && !signed && (
        <div className="no-print rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          قرارداد مالی (نقدی و چک) هنوز توسط مدیریت برای فرزند شما تکمیل نشده است. پس از تکمیل، می‌توانید قرارداد را مطالعه و امضا کنید.
        </div>
      )}

      {signed && (
        <div className="no-print rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ قرارداد در تاریخ{' '}
          {signedAt ? new Date(signedAt).toLocaleDateString('fa-IR', { dateStyle: 'long' }) : '—'} توسط{' '}
          {signerRole === 'mother' ? 'مادر' : 'پدر'} نوآموز ثبت شد. این نسخه ثابت است و تغییر نمی‌کند.
        </div>
      )}

      {!signed && (
        <div className="no-print rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-extrabold text-navy">این قرارداد توسط چه کسی امضا می‌شود؟</p>
          <div className="flex flex-wrap gap-3">
            {signerOptions.map((opt) => (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  signerRole === opt.key
                    ? 'border-pink-deep bg-pink-soft/50 text-pink-deep'
                    : 'border-navy/10 text-navy hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="signerRole"
                  value={opt.key}
                  checked={signerRole === opt.key}
                  onChange={() => setSignerRole(opt.key)}
                  className="accent-pink-deep"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div
        id="contract-print-root"
        className={`rounded-3xl bg-white p-6 shadow-xl ring-1 ring-navy/10 sm:p-8 ${canPrint ? 'contract-print-ready' : ''}`}
      >
        <TuitionContractDocument fields={displayFields} signed={signed} />
      </div>

      {!signed && (
        <form onSubmit={handleSign} className="no-print space-y-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold text-navy">امضا و تأیید نهایی</p>

          <div className="rounded-xl border border-navy/10 bg-slate-50/60 p-4">
            <p className="text-sm font-extrabold text-navy">بارگذاری تصویر امضا</p>
            <p className="mt-1 text-xs leading-6 text-slate-muted">
              روی برگه سفید با خودکار امضا کنید، از امضا عکس بگیرید و اینجا بارگذاری کنید.
            </p>
            {parentSignatureUrl ? (
              <img
                src={parentSignatureUrl}
                alt="امضای والد"
                className="mt-3 max-h-24 rounded-lg border border-navy/10 bg-white p-2"
              />
            ) : null}
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-dark">
              {uploadingSignature ? 'در حال آپلود...' : parentSignatureUrl ? 'تغییر تصویر امضا' : 'انتخاب تصویر امضا'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingSignature}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadSignature(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 bg-slate-50/60 p-4 text-sm leading-7">
            <input
              type="checkbox"
              checked={workshopConsent}
              onChange={(e) => setWorkshopConsent(e.target.checked)}
              className="mt-1 accent-pink-deep"
              required
            />
            <span>
              رضایت و مشارکت خود را نسبت به تشکیل کلاس‌های تکمیلی (لیوان چینی، رباتیک، کارگاه هوش و ...)
              اعلام می‌کنم.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 bg-slate-50/60 p-4 text-sm leading-7">
            <input
              type="checkbox"
              checked={contractAccepted}
              onChange={(e) => setContractAccepted(e.target.checked)}
              className="mt-1 accent-pink-deep"
              required
            />
            <span>
              مفاد این قرارداد را مطالعه نموده‌ام و موافقت خود را اعلام می‌دارم.
            </span>
          </label>

          {displayFields?.hasAmanatChecks ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm leading-7">
              <input
                type="checkbox"
                checked={amanatCommitmentAccepted}
                onChange={(e) => setAmanatCommitmentAccepted(e.target.checked)}
                className="mt-1 accent-amber-600"
                required
              />
              <span>
                متعهد می‌شوم در ازای چک(های) امانت ثبت‌شده در قرارداد، مبالغ پرداخت نقدی را مطابق تاریخ‌ها و
                مبالغ تعیین‌شده توسط مدیریت در جدول «برنامه پرداخت نقدی چک امانت» پرداخت کنم.
              </span>
            </label>
          ) : null}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!otpSent ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={sendOtp}
                disabled={sendingOtp || !workshopConsent || !contractAccepted || !parentSignatureUrl || !settingsConfigured || !financialPlanReady || (displayFields?.hasAmanatChecks && !amanatCommitmentAccepted)}
                className="rounded-2xl bg-gradient-to-l from-pink-deep to-rose px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
              >
                {sendingOtp ? 'در حال ارسال کد...' : 'دریافت کد تایید پیامکی'}
              </button>
              <div
                className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400"
                aria-hidden
              >
                <svg className="h-5 w-5 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>برای تأیید هویت، کد پیامکی به موبایل امضاکننده ارسال می‌شود</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-pink-deep/20 bg-pink-soft/20 p-4">
              <div>
                <p className="text-sm font-extrabold text-navy">کد تایید پیامکی</p>
                <p className="mt-1 text-xs leading-6 text-slate-muted">
                  کد ۶ رقمی ارسال‌شده به شمارهٔ{' '}
                  <span dir="ltr" className="font-bold text-navy">{maskPhone(otpPhone)}</span>{' '}
                  را وارد کنید.
                </p>
              </div>
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(onlyEnglishDigits(e.target.value).slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                placeholder="- - - - - -"
                className="w-full max-w-xs rounded-xl border border-navy/15 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.4em] text-navy focus:border-pink-deep focus:outline-none"
              />
              {otpNote ? <p className="text-xs font-semibold text-amber-700">{otpNote}</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting || otpCode.trim().length < 6 || !settingsConfigured || !financialPlanReady}
                  className="rounded-2xl bg-gradient-to-l from-pink-deep to-rose px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? 'در حال ثبت...' : 'ثبت و امضای نهایی قرارداد'}
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="text-xs font-bold text-pink-deep underline underline-offset-4 hover:text-rose disabled:opacity-50"
                >
                  {sendingOtp ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                </button>
              </div>
              <p className="text-xs text-slate-400">پس از ثبت، قرارداد قابل چاپ می‌شود و مبالغ به فاکتور منتقل می‌گردد.</p>
            </div>
          )}
        </form>
      )}

      {signed && (
        <div className="no-print rounded-2xl border border-navy/10 bg-gradient-to-l from-slate-50 to-white p-5 shadow-sm ring-1 ring-navy/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-navy">دریافت نسخه قرارداد</p>
              <p className="mt-1 text-xs text-slate-muted">قرارداد ثبت شد — می‌توانید چاپ بگیرید یا به‌صورت PDF ذخیره کنید.</p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-navy/15 bg-white px-6 py-3.5 text-sm font-bold text-navy shadow-md ring-1 ring-navy/10 transition hover:border-pink-deep/30 hover:bg-pink-soft/20 hover:text-pink-deep hover:shadow-lg"
            >
              <svg className="h-5 w-5 text-pink-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              چاپ / ذخیره PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
