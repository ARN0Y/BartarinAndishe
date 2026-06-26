'use client'

import { useEffect, useRef, useState } from 'react'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import { normalizeIdCardSeries } from '@/lib/idCardSeries'

const inp = 'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60'
const lbl = 'mb-1.5 block text-xs font-semibold text-foreground'

// ── Sanitizers ──────────────────────────────────────────────
const onlyDigits = (max) => (v) => v.replace(/\D/g, '').slice(0, max)
const onlyTwoDigits = onlyDigits(2)
const onlySixDigits = onlyDigits(6)
const onlyTenDigits = onlyDigits(10)

const MOBILE_PHONE_FIELDS = new Set(['fatherPhone', 'motherPhone', 'shadPhone', 'govPhone'])

function mobileWithoutLeadingZeroError(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('0')) return 'شماره همراه را بدون صفر وارد کنید.'
  return null
}

// ── Validation rules per tab ─────────────────────────────────
const TAB_REQUIRED = {
  student: [
    { key: 'birthDate',          label: 'تاریخ تولد' },
    { key: 'birthCertIssuePlace',label: 'محل صدور شناسنامه' },
    { key: 'birthPlace',         label: 'محل تولد' },
    { key: 'gender',             label: 'جنسیت' },
    { key: 'idCardRow',          label: 'ردیف شناسنامه' },
    { key: 'idCardSeries',       label: 'سری شناسنامه' },
    { key: 'idCardSerial',       label: 'شماره سریال شناسنامه' },
    { key: '__photo__',          label: 'عکس نوآموز' },
  ],
  parents: [
    { key: 'fatherFirstName',   label: 'نام پدر' },
    { key: 'fatherLastName',    label: 'نام خانوادگی پدر' },
    { key: 'fatherNationalId',  label: 'کد ملی پدر' },
    { key: 'fatherBirthDate',   label: 'تاریخ تولد پدر' },
    { key: 'fatherNationality', label: 'ملیت پدر' },
    { key: 'fatherPhone',       label: 'موبایل پدر' },
    { key: 'fatherIdNumber',    label: 'شماره شناسنامه پدر' },
    { key: 'fatherIdIssuePlace',label: 'محل صدور شناسنامه پدر' },
    { key: 'fatherEducation',   label: 'مدرک تحصیلی پدر' },
    { key: 'fatherJob',         label: 'شغل پدر' },
    { key: 'motherFirstName',   label: 'نام مادر' },
    { key: 'motherLastName',    label: 'نام خانوادگی مادر' },
    { key: 'motherNationalId',  label: 'کد ملی مادر' },
    { key: 'motherBirthDate',   label: 'تاریخ تولد مادر' },
    { key: 'motherNationality', label: 'ملیت مادر' },
    { key: 'motherPhone',       label: 'موبایل مادر' },
    { key: 'motherIdNumber',    label: 'شماره شناسنامه مادر' },
    { key: 'motherIdIssuePlace',label: 'محل صدور شناسنامه مادر' },
    { key: 'motherEducation',   label: 'مدرک تحصیلی مادر' },
    { key: 'motherJob',         label: 'شغل مادر' },
  ],
  extra: [
    { key: 'housingStatus', label: 'وضعیت مسکن' },
  ],
  address: [
    { key: 'address',     label: 'آدرس منزل' },
    { key: 'homePhone',   label: 'تلفن منزل' },
    { key: 'postalCode',  label: 'کد پستی' },
    { key: 'shadPhone',   label: 'موبایل شبکه شاد' },
    { key: 'govPhone',    label: 'موبایل درگاه دولت' },
  ],
}

// ── Options ─────────────────────────────────────────────────
const EDUCATION = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'diploma', label: 'دیپلم متوسطه' },
  { value: 'assoc', label: 'فوق دیپلم' },
  { value: 'bachelor', label: 'لیسانس' },
  { value: 'master', label: 'فوق لیسانس' },
  { value: 'phd', label: 'دکتری' },
  { value: 'seminary', label: 'تحصیلات حوزوی' },
]
const JOBS = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'unemployed', label: 'بیکار' },
  { value: 'labor', label: 'کارگر ساده' },
  { value: 'private_employee', label: 'کارمند موسسات غیردولتی' },
  { value: 'freelance_art', label: 'آزاد هنری و خدماتی' },
  { value: 'agriculture', label: 'کشاورزی یا دامداری' },
  { value: 'freelance_industry', label: 'آزاد صنعتی' },
  { value: 'gov_employee', label: 'سایر کارمندان دولت' },
  { value: 'housewife', label: 'خانه‌دار' },
  { value: 'health', label: 'بهداشتی و درمانی' },
  { value: 'military', label: 'نظامی و انتظامی' },
  { value: 'cultural', label: 'فرهنگی' },
]
const HOUSING = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'own_family', label: 'شخصی با خانواده' },
  { value: 'rent_family', label: 'اجاره با خانواده' },
  { value: 'org_family', label: 'سازمانی با خانواده' },
  { value: 'other_family', label: 'سایر با خانواده' },
  { value: 'relatives', label: 'منزل بستگان' },
]
const NATIONALITY = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'iranian', label: 'ایرانی' },
  { value: 'foreign', label: 'اتباع' },
]
const GENDER = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'دختر', label: 'دختر' },
  { value: 'پسر', label: 'پسر' },
]
const ID_CARD_SERIES = [
  { value: '', label: 'انتخاب کنید' },
  { value: 'الف', label: 'الف' },
  { value: 'ب', label: 'ب' },
  { value: 'پ', label: 'پ' },
  { value: 'ت', label: 'ت' },
  { value: 'ث', label: 'ث' },
  { value: 'ج', label: 'ج' },
  { value: 'چ', label: 'چ' },
  { value: 'ح', label: 'ح' },
  { value: 'خ', label: 'خ' },
  { value: 'د', label: 'د' },
  { value: 'ذ', label: 'ذ' },
  { value: 'ر', label: 'ر' },
  { value: 'ز', label: 'ز' },
  { value: 'ژ', label: 'ژ' },
  { value: 'س', label: 'س' },
  { value: 'ش', label: 'ش' },
  { value: 'ص', label: 'ص' },
  { value: 'ض', label: 'ض' },
  { value: 'ط', label: 'ط' },
  { value: 'ظ', label: 'ظ' },
  { value: 'ع', label: 'ع' },
  { value: 'غ', label: 'غ' },
  { value: 'ف', label: 'ف' },
  { value: 'ق', label: 'ق' },
  { value: 'ک', label: 'ک' },
  { value: 'گ', label: 'گ' },
  { value: 'ل', label: 'ل' },
  { value: 'م', label: 'م' },
  { value: 'ن', label: 'ن' },
  { value: 'و', label: 'و' },
  { value: 'ه', label: 'ه' },
  { value: 'ی', label: 'ی' },
]

const SUBTABS = [
  { key: 'student', label: 'اطلاعات شناسنامه‌ای' },
  { key: 'parents', label: 'مشخصات والدین' },
  { key: 'extra',   label: 'اطلاعات تکمیلی' },
  { key: 'address', label: 'آدرس و تماس' },
  { key: 'status',  label: 'وضعیت تحصیلی' },
]

// ── Base components ──────────────────────────────────────────
function Field({ label: labelText, hint, error, children }) {
  return (
    <div>
      <label className={lbl}>
        {labelText} <span className="text-red-400">*</span>
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-bold text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-slate-muted">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, maxLength, ltr = false, sanitize, disabled = false, inputMode }) {
  function handleChange(e) {
    const v = sanitize ? sanitize(e.target.value) : e.target.value
    onChange(v)
  }
  return (
    <input
      value={value || ''}
      onChange={handleChange}
      className={`${inp}${ltr ? ' ltr text-right' : ''}${disabled ? ' opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      inputMode={inputMode}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={inp}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function ParentFields({ prefix, data, onChange, title, fieldErrors }) {
  function f(field) { return data[`${prefix}${field}`] }
  function set(field) { return (v) => onChange(`${prefix}${field}`, v) }
  function err(field) { return fieldErrors?.[`${prefix}${field}`] }
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-5">
      <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold text-foreground">{title}</h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="نام" error={err('FirstName')}>
          <Input value={f('FirstName')} onChange={set('FirstName')} placeholder="نام" />
        </Field>
        <Field label="نام خانوادگی" error={err('LastName')}>
          <Input value={f('LastName')} onChange={set('LastName')} placeholder="نام خانوادگی" />
        </Field>
        <Field label="کد ملی" hint="۱۰ رقم" error={err('NationalId')}>
          <Input value={f('NationalId')} onChange={set('NationalId')} placeholder="10 رقم" maxLength={10} ltr sanitize={onlyTenDigits} inputMode="numeric" />
        </Field>
        <Field label="تاریخ تولد (شمسی)" error={err('BirthDate')}>
          <JalaliDatePicker value={f('BirthDate')} onChange={set('BirthDate')} yearStart={1350} yearEnd={1405} />
        </Field>
        <Field label="ملیت" error={err('Nationality')}>
          <Select value={f('Nationality')} onChange={set('Nationality')} options={NATIONALITY} />
        </Field>
        <Field label="موبایل" hint="۱۰ رقم — بدون صفر ابتدا" error={err('Phone')}>
          <Input value={f('Phone')} onChange={set('Phone')} placeholder="9XXXXXXXXX" maxLength={10} ltr sanitize={onlyTenDigits} inputMode="numeric" />
        </Field>
        <Field label="شماره شناسنامه" error={err('IdNumber')}>
          <Input value={f('IdNumber')} onChange={set('IdNumber')} placeholder="شماره شناسنامه" ltr />
        </Field>
        <Field label="محل صدور شناسنامه" error={err('IdIssuePlace')}>
          <Input value={f('IdIssuePlace')} onChange={set('IdIssuePlace')} placeholder="مثال: تهران" />
        </Field>
        <Field label="مدرک تحصیلی" error={err('Education')}>
          <Select value={f('Education')} onChange={set('Education')} options={EDUCATION} />
        </Field>
        <Field label="شغل" error={err('Job')}>
          <Select value={f('Job')} onChange={set('Job')} options={JOBS} />
        </Field>
      </div>
    </div>
  )
}

// ── Photo Upload Box ─────────────────────────────────────────
function PhotoUploadBox({ currentUrl, onUploaded, error, photoUploadUrl = '/api/parent/profile/photo' }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')

  useEffect(() => {
    if (currentUrl && !preview) setPreview(currentUrl)
  }, [currentUrl])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErr('')

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch(photoUploadUrl, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در آپلود')
      onUploaded(json.photoUrl)
    } catch (err) {
      setUploadErr(err.message)
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <label className={lbl}>
        عکس نوآموز <span className="text-red-400">*</span>
      </label>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 transition ${
          error ? 'border-red-400' : 'border-pink/40 hover:border-pink-deep'
        } bg-slate-50 shadow-md`}
      >
        {preview ? (
          <img src={preview} alt="عکس نوآموز" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16a4 4 0 100-8 4 4 0 000 8zm0 0v2m0-10V6M6 12H4m16 0h-2" />
              <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
            </svg>
            <span className="text-xs">انتخاب عکس</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="text-xs font-bold text-pink-deep">آپلود...</span>
          </div>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <p className="text-center text-xs text-slate-muted">فرمت: JPG، PNG یا WebP — حداکثر ۳ مگابایت</p>
      {(error || uploadErr) && (
        <p className="text-xs font-bold text-red-500">{uploadErr || error}</p>
      )}
    </div>
  )
}

// آخرین سال شمسی جاری (برای محدوده تاریخ تولد نوآموز)
function currentJalaliYear() {
  const now = new Date()
  const gy = now.getFullYear()
  const gm = now.getMonth() + 1
  const gd = now.getDate()
  // نوروز حدود ۲۹ اسفند = ۲۰ مارس
  return (gm < 3 || (gm === 3 && gd < 20)) ? gy - 622 : gy - 621
}

const TAB_KEYS = ['student', 'parents', 'extra', 'address', 'status']

// ── Main component ───────────────────────────────────────────
export default function StudentProfileForm({
  student,
  initialProfile,
  registrationStatus,
  preRegBirthDate,
  saveUrl = '/api/parent/profile',
  photoUploadUrl = '/api/parent/profile/photo',
  adminMode = false,
  readOnly = false,
  onSaved,
}) {
  const [subTab, setSubTab] = useState('student')
  const [profile, setProfile] = useState(() => {
    const base = initialProfile || {}
    if (!base.birthDate && preRegBirthDate) base.birthDate = preRegBirthDate
    if (base.idCardSeries) base.idCardSeries = normalizeIdCardSeries(base.idCardSeries)
    return base
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formCompleted, setFormCompleted] = useState(false)
  const [completedTabs, setCompletedTabs] = useState(() => new Set())
  const [err, setErr] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const formRef = useRef(null)
  const jalaliYearEnd = currentJalaliYear()

  useEffect(() => {
    setProfile((prev) => {
      const base = { ...(initialProfile || {}) }
      if (!base.birthDate && preRegBirthDate) base.birthDate = preRegBirthDate
      if (base.idCardSeries) base.idCardSeries = normalizeIdCardSeries(base.idCardSeries)
      return { ...base, ...prev }
    })
  }, [initialProfile, preRegBirthDate])

  function set(field, value) {
    setProfile((p) => ({ ...p, [field]: value }))
    setSaved(false)
    if (MOBILE_PHONE_FIELDS.has(field)) {
      const phoneErr = mobileWithoutLeadingZeroError(value)
      setFieldErrors((fe) => {
        const n = { ...fe }
        if (phoneErr) n[field] = phoneErr
        else delete n[field]
        return n
      })
      return
    }
    if (fieldErrors[field]) setFieldErrors((fe) => { const n = { ...fe }; delete n[field]; return n })
  }

  function p(field) { return profile[field] }

  function validate() {
    const rules = TAB_REQUIRED[subTab] || []
    const errors = {}
    for (const { key, label } of rules) {
      if (key === '__photo__') {
        if (!profile.photoUrl) errors[key] = `«${label}» اجباری است`
      } else if (!profile[key] || String(profile[key]).trim() === '') {
        errors[key] = `«${label}» اجباری است`
      }
    }
    for (const key of MOBILE_PHONE_FIELDS) {
      const phoneErr = mobileWithoutLeadingZeroError(profile[key])
      if (phoneErr) errors[key] = phoneErr
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function fieldErr(key) { return fieldErrors[key] }

  function advanceToNextTab(currentKey) {
    const currentIdx = TAB_KEYS.indexOf(currentKey)
    const nextKey = TAB_KEYS[currentIdx + 1]
    if (!nextKey) return

    setCompletedTabs((prev) => new Set([...prev, currentKey]))
    setSubTab(nextKey)
    setFieldErrors({})
    setErr('')
    setSaved(false)
    if (nextKey === 'status') setFormCompleted(true)
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function save() {
    if (!adminMode && !validate()) {
      setErr('لطفاً همه فیلدهای ستاره‌دار را پر کنید.')
      return
    }
    setSaving(true)
    setErr('')
    try {
      const res = await fetch(saveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          idCardSeries: profile.idCardSeries ? normalizeIdCardSeries(profile.idCardSeries) : profile.idCardSeries,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.message || 'خطا در ذخیره'); return }
      if (json.profile) setProfile((prev) => ({ ...prev, ...json.profile }))
      setSaved(true)

      if (adminMode) {
        onSaved?.(json.profile)
        setTimeout(() => { setSaved(false); setErr('') }, 1200)
        return
      }

      advanceToNextTab(subTab)
      onSaved?.(json.profile)
    } catch {
      setErr('خطا در اتصال به سرور.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={formRef} className="space-y-5 scroll-mt-section">

      {/* بنر قفل پروفایل */}
      {readOnly && !adminMode && (
        <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-100">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">✓</span>
          <div>
            <p className="font-extrabold text-base">پروفایل تکمیل و قفل شده است</p>
            <p className="mt-0.5 text-sm text-emerald-800/80 dark:text-emerald-100/75">اطلاعات نوآموز ثبت شده و قابل ویرایش توسط والدین نیست. در صورت نیاز به ویرایش با مدیریت تماس بگیرید.</p>
          </div>
        </div>
      )}

      {/* sub-tab bar */}
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-1.5 shadow-sm">
        {SUBTABS.map((t) => {
          const isDone = completedTabs.has(t.key)
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setSubTab(t.key); setFieldErrors({}); setErr(''); setSaved(false) }}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-xs font-bold transition ${
                subTab === t.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isDone
                  ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {isDone && <span>✓</span>}
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── تب ۱: مشخصات نوآموز ── */}
      {subTab === 'student' && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="mb-5 text-sm text-muted-foreground">اطلاعات شناسنامه و عکس نوآموز را وارد کنید.</p>

          {/* Photo upload - centered at top */}
          <div className="mb-6 flex justify-center">
            <PhotoUploadBox
              currentUrl={p('photoUrl')}
              onUploaded={(url) => set('photoUrl', url)}
              error={fieldErr('__photo__')}
              photoUploadUrl={photoUploadUrl}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={lbl}>نام <span className="text-xs font-normal text-slate-muted">(از سیستم)</span></label>
              <Input value={student?.firstName} onChange={() => {}} disabled />
            </div>
            <div>
              <label className={lbl}>نام خانوادگی <span className="text-xs font-normal text-slate-muted">(از سیستم)</span></label>
              <Input value={student?.lastName} onChange={() => {}} disabled />
            </div>
            <div>
              <label className={lbl}>شماره ملی / شناسنامه <span className="text-xs font-normal text-slate-muted">(از سیستم)</span></label>
              <Input value={student?.nationalId} onChange={() => {}} disabled ltr />
            </div>
            <Field label="تاریخ تولد (شمسی)" error={fieldErr('birthDate')}>
              <JalaliDatePicker value={p('birthDate')} onChange={(v) => set('birthDate', v)} yearStart={1399} yearEnd={jalaliYearEnd} />
            </Field>
            <Field label="محل صدور شناسنامه" error={fieldErr('birthCertIssuePlace')}>
              <Input value={p('birthCertIssuePlace')} onChange={(v) => set('birthCertIssuePlace', v)} placeholder="مثال: تهران" />
            </Field>
            <Field label="محل تولد" error={fieldErr('birthPlace')}>
              <Input value={p('birthPlace')} onChange={(v) => set('birthPlace', v)} placeholder="مثال: تهران" />
            </Field>
            <Field label="جنسیت" error={fieldErr('gender')}>
              <Select value={p('gender')} onChange={(v) => set('gender', v)} options={GENDER} />
            </Field>
            <Field label="ردیف شناسنامه" hint="فقط ۲ رقم عددی" error={fieldErr('idCardRow')}>
              <Input value={p('idCardRow')} onChange={(v) => set('idCardRow', v)} placeholder="مثال: ۱۲" maxLength={2} ltr sanitize={onlyTwoDigits} inputMode="numeric" />
            </Field>
            <Field label="سری شناسنامه" hint="همان‌طور که روی شناسنامه نوشته (مثال: الف)" error={fieldErr('idCardSeries')}>
              <Select value={p('idCardSeries')} onChange={(v) => set('idCardSeries', normalizeIdCardSeries(v))} options={ID_CARD_SERIES} />
            </Field>
            <Field label="شماره سریال شناسنامه" hint="فقط ۶ رقم عددی" error={fieldErr('idCardSerial')}>
              <Input value={p('idCardSerial')} onChange={(v) => set('idCardSerial', v)} placeholder="123456" maxLength={6} ltr sanitize={onlySixDigits} inputMode="numeric" />
            </Field>
          </div>
        </div>
      )}

      {/* ── تب ۲: مشخصات والدین ── */}
      {subTab === 'parents' && (
        <div className="space-y-5">
          <ParentFields prefix="father" data={profile} onChange={set} title="مشخصات پدر" fieldErrors={fieldErrors} />
          <ParentFields prefix="mother" data={profile} onChange={set} title="مشخصات مادر" fieldErrors={fieldErrors} />
        </div>
      )}

      {/* ── تب ۳: اطلاعات تکمیلی ── */}
      {subTab === 'extra' && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-foreground">اطلاعات تکمیلی</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="وضعیت مسکن" error={fieldErr('housingStatus')}>
              <Select value={p('housingStatus')} onChange={(v) => set('housingStatus', v)} options={HOUSING} />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="leftHanded"
              type="checkbox"
              checked={!!p('leftHanded')}
              onChange={(e) => set('leftHanded', e.target.checked)}
              className="size-5 rounded border-input accent-primary"
            />
            <label htmlFor="leftHanded" className="cursor-pointer text-sm font-semibold text-foreground">
              نوآموز چپ‌دست است
            </label>
          </div>
        </div>
      )}

      {/* ── تب ۴: آدرس و تماس ── */}
      {subTab === 'address' && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-foreground">آدرس و تماس</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="آدرس منزل" error={fieldErr('address')}>
                <textarea
                  value={p('address') || ''}
                  onChange={(e) => { set('address', e.target.value); if(fieldErrors.address) setFieldErrors(fe => { const n={...fe}; delete n.address; return n }) }}
                  className={`min-h-[80px] ${inp}`}
                  placeholder="آدرس کامل محل سکونت"
                  maxLength={500}
                />
              </Field>
            </div>
            <Field label="تلفن منزل" error={fieldErr('homePhone')}>
              <Input value={p('homePhone')} onChange={(v) => set('homePhone', v)} placeholder="021XXXXXXXX" ltr />
            </Field>
            <Field label="کد پستی" hint="۱۰ رقم عددی" error={fieldErr('postalCode')}>
              <Input value={p('postalCode')} onChange={(v) => set('postalCode', v)} placeholder="XXXXXXXXXX" maxLength={10} ltr sanitize={onlyTenDigits} inputMode="numeric" />
            </Field>
            <Field label="موبایل شبکه شاد" hint="۱۰ رقم — بدون صفر ابتدا" error={fieldErr('shadPhone')}>
              <Input value={p('shadPhone')} onChange={(v) => set('shadPhone', v)} placeholder="9XXXXXXXXX" maxLength={10} ltr sanitize={onlyTenDigits} inputMode="numeric" />
            </Field>
            <Field label="موبایل درگاه دولت" hint="۱۰ رقم — بدون صفر ابتدا" error={fieldErr('govPhone')}>
              <Input value={p('govPhone')} onChange={(v) => set('govPhone', v)} placeholder="9XXXXXXXXX" maxLength={10} ltr sanitize={onlyTenDigits} inputMode="numeric" />
            </Field>
          </div>
        </div>
      )}

      {/* ── تب ۵: وضعیت تحصیلی ── */}
      {subTab === 'status' && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="text-base font-bold text-foreground">وضعیت تحصیلی</h3>

          {formCompleted && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">✓</span>
              <div>
                <p className="text-base font-extrabold text-green-700">اطلاعات شما با موفقیت ثبت شد!</p>
                <p className="mt-1 text-sm text-green-600">تمام مشخصات نوآموز با موفقیت در سیستم ذخیره گردید.</p>
              </div>
            </div>
          )}

          <div className={`rounded-lg px-5 py-4 ${
            registrationStatus === 'Confirmed'
              ? 'bg-green-50 ring-1 ring-green-200'
              : 'bg-amber-50 ring-1 ring-amber-200'
          }`}>
            <p className={`text-base font-extrabold ${
              registrationStatus === 'Confirmed' ? 'text-green-700' : 'text-amber-700'
            }`}>
              {registrationStatus === 'Confirmed'
                ? '✅ ثبت‌نام قطعی — نوآموز در کودکستان ثبت‌نام شده است.'
                : '⏳ در انتظار تأیید — ثبت‌نام هنوز قطعی نشده است.'}
            </p>
            {registrationStatus === 'Confirmed' && (
              <p className="mt-2 text-sm text-green-600 leading-7">
                وضعیت ثبت‌نام: <strong>قطعی</strong><br />
                نوآموز: <strong>{student?.firstName} {student?.lastName}</strong><br />
                کد ملی: <strong className="ltr">{student?.nationalId}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* save button */}
      {subTab !== 'status' && !readOnly && (
        <div className="space-y-2">
          {err && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-bold text-red-600">{err}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {Object.values(fieldErrors).map((msg, i) => (
                    <li key={i} className="text-xs text-red-500">{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'در حال ذخیره...' : subTab === 'address' ? 'ذخیره و مشاهده وضعیت' : 'ذخیره و ادامه به مرحله بعد'}
            </button>
            {saved && <span className="text-sm font-bold text-green-600">✓ ذخیره شد — در حال انتقال...</span>}
          </div>
        </div>
      )}
    </div>
  )
}
