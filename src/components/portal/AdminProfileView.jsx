'use client'

import { useState } from 'react'
import { normalizeIdCardSeries } from '@/lib/idCardSeries'
import StudentProfileForm from './StudentProfileForm'

const EDUCATION_LABEL = { diploma:'دیپلم متوسطه', assoc:'فوق دیپلم', bachelor:'لیسانس', master:'فوق لیسانس', phd:'دکتری', seminary:'تحصیلات حوزوی' }
const JOB_LABEL = { unemployed:'بیکار', labor:'کارگر ساده', private_employee:'کارمند موسسات غیردولتی', freelance_art:'آزاد هنری و خدماتی', agriculture:'کشاورزی یا دامداری', freelance_industry:'آزاد صنعتی', gov_employee:'سایر کارمندان دولت', housewife:'خانه‌دار', health:'بهداشتی و درمانی', military:'نظامی و انتظامی', cultural:'فرهنگی' }
const HOUSING_LABEL = { own_family:'شخصی با خانواده', rent_family:'اجاره با خانواده', org_family:'سازمانی با خانواده', other_family:'سایر با خانواده', relatives:'منزل بستگان' }
const NATIONALITY_LABEL = { iranian:'ایرانی', foreign:'اتباع' }

const SUBTABS = [
  { key: 'student', label: 'مشخصات نوآموز' },
  { key: 'parents', label: 'مشخصات والدین' },
  { key: 'extra',   label: 'اطلاعات تکمیلی' },
  { key: 'address', label: 'آدرس و تماس' },
]

function Row({ label, value, ltr = false }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-muted">{label}</span>
      <span className={`text-sm font-bold text-navy${ltr ? ' ltr text-right' : ''}`}>{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-navy/10">
      {title && <h5 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-pink-deep border-b border-pink/20 pb-2">{title}</h5>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

function ParentSection({ title, p, prefix }) {
  function f(field) { return p[`${prefix}${field}`] }
  return (
    <Section title={title}>
      <Row label="نام" value={f('FirstName')} />
      <Row label="نام خانوادگی" value={f('LastName')} />
      <Row label="کد ملی" value={f('NationalId')} ltr />
      <Row label="تاریخ تولد" value={f('BirthDate')} ltr />
      <Row label="ملیت" value={NATIONALITY_LABEL[f('Nationality')] || f('Nationality')} />
      <Row label="موبایل" value={f('Phone')} ltr />
      <Row label="شماره شناسنامه" value={f('IdNumber')} ltr />
      <Row label="محل صدور شناسنامه" value={f('IdIssuePlace')} />
      <Row label="مدرک تحصیلی" value={EDUCATION_LABEL[f('Education')] || f('Education')} />
      <Row label="شغل" value={JOB_LABEL[f('Job')] || f('Job')} />
    </Section>
  )
}

export default function AdminProfileView({ profileEntry, onClose, onUpdated }) {
  const [mode, setMode] = useState('view')
  const [subTab, setSubTab] = useState('student')
  const [entry, setEntry] = useState(profileEntry)
  const { student, ...p } = entry
  const sid = student.id

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-pink/20 px-6 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-navy">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-xs text-slate-muted ltr">{student.nationalId}</p>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="rounded-xl bg-pink-deep px-4 py-2 text-sm font-bold text-white hover:bg-rose"
              >
                ویرایش کامل
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('view')}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-navy hover:bg-slate-200"
              >
                بازگشت به مشاهده
              </button>
            )}
            {p.photoUrl && mode === 'view' && (
              <img src={p.photoUrl} alt="عکس نوآموز" className="h-14 w-14 rounded-full object-cover ring-2 ring-pink/30" />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-navy hover:bg-slate-200"
            >
              بستن
            </button>
          </div>
        </div>

        {mode === 'edit' ? (
          <div className="p-5">
            <StudentProfileForm
              student={student}
              initialProfile={p}
              registrationStatus={student.registrationStatus}
              saveUrl={`/api/admin/profiles/${sid}`}
              photoUploadUrl={`/api/admin/profiles/${sid}/photo`}
              adminMode
              onSaved={(profile) => {
                setEntry((prev) => ({ ...prev, ...profile }))
                onUpdated?.()
              }}
            />
          </div>
        ) : (
        <>
        {/* sub-tab bar */}
        <div className="flex flex-wrap gap-2 border-b border-pink/10 px-4 py-3">
          {SUBTABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSubTab(t.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                subTab === t.key
                  ? 'bg-gradient-to-l from-pink-deep to-rose text-white shadow'
                  : 'text-navy bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="space-y-4 p-5">
          {subTab === 'student' && (
            <>
              {p.photoUrl && (
                <div className="flex justify-center">
                  <img src={p.photoUrl} alt="عکس" className="h-28 w-28 rounded-full object-cover ring-4 ring-pink/20 shadow" />
                </div>
              )}
              <Section title="مشخصات نوآموز">
                <Row label="نام" value={student.firstName} />
                <Row label="نام خانوادگی" value={student.lastName} />
                <Row label="کد ملی" value={student.nationalId} ltr />
                <Row label="تاریخ تولد" value={p.birthDate} ltr />
                <Row label="محل تولد" value={p.birthPlace} />
                <Row label="جنسیت" value={p.gender} />
                <Row label="محل صدور شناسنامه" value={p.birthCertIssuePlace} />
                <Row label="ردیف شناسنامه" value={p.idCardRow} ltr />
                <Row label="سری شناسنامه" value={normalizeIdCardSeries(p.idCardSeries)} />
                <Row label="سریال شناسنامه" value={p.idCardSerial} ltr />
              </Section>
            </>
          )}

          {subTab === 'parents' && (
            <>
              <ParentSection title="مشخصات پدر" p={p} prefix="father" />
              <ParentSection title="مشخصات مادر" p={p} prefix="mother" />
            </>
          )}

          {subTab === 'extra' && (
            <Section title="اطلاعات تکمیلی">
              <Row label="وضعیت مسکن" value={HOUSING_LABEL[p.housingStatus] || p.housingStatus} />
              <Row label="چپ‌دست" value={p.leftHanded ? 'بله' : 'خیر'} />
            </Section>
          )}

          {subTab === 'address' && (
            <Section title="آدرس و تماس">
              <div className="sm:col-span-2 lg:col-span-3">
                <Row label="آدرس منزل" value={p.address} />
              </div>
              <Row label="تلفن منزل" value={p.homePhone} ltr />
              <Row label="کد پستی" value={p.postalCode} ltr />
              <Row label="موبایل شبکه شاد" value={p.shadPhone} ltr />
              <Row label="موبایل درگاه دولت" value={p.govPhone} ltr />
            </Section>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}
