import Link from 'next/link'
import SectionShell from './SectionShell'
import { siteContact, registrationSteps } from '../../data/siteContact'
import { FileEdit, Phone, CheckCircle } from 'lucide-react'

const STEP_ICONS = { FileEdit, Phone, CheckCircle }

export default function RegisterInfoSection() {
  return (
    <SectionShell
      id="register-info"
      badge="ثبت‌نام و تماس"
      title="مراحل ثبت‌نام و راه‌های ارتباط"
      subtitle="اطلاعات عملی برای والدین — آدرس، ساعت کاری و مسیر ثبت‌نام"
      compact
      className="bg-gradient-to-b from-white via-amber-50/20 to-pink-soft/20"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/8 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-extrabold text-foreground">اطلاعات تماس</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-bold text-muted-foreground">آدرس</dt>
              <dd className="mt-1 leading-7 text-foreground">{siteContact.address} — {siteContact.city}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-muted-foreground">پایه‌های تحصیلی</dt>
              <dd className="mt-1 font-semibold text-pink-deep">{siteContact.gradeLevels}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-muted-foreground">ساعت آموزش کودکستان</dt>
              <dd className="mt-1 text-foreground">{siteContact.kindergartenHours}</dd>
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <div>
                <dt className="text-[11px] font-bold text-muted-foreground">تلفن مدرسه</dt>
                <dd className="mt-1">
                  <a href={`tel:${siteContact.schoolPhone}`} className="font-bold text-foreground ltr inline-block" dir="ltr">
                    {siteContact.schoolPhoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold text-muted-foreground">مدیریت</dt>
                <dd className="mt-1">
                  <a href={`tel:${siteContact.managerPhone}`} className="font-bold text-foreground ltr inline-block" dir="ltr">
                    {siteContact.managerPhoneDisplay}
                  </a>
                </dd>
              </div>
            </div>
          </dl>
          <a
            href={siteContact.baladUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-pink/20 bg-pink-soft/30 px-4 py-2 text-xs font-bold text-pink-deep transition hover:bg-pink-soft/50"
          >
            مشاهده روی نقشه
          </a>
        </div>

        <div className="rounded-2xl border border-navy/8 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-extrabold text-foreground">۳ قدم ثبت‌نام</h3>
          <ol className="space-y-4">
            {registrationSteps.map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground shadow-sm">
                  {(() => { const I = STEP_ICONS[item.iconName]; return I ? <I className="h-5 w-5 text-pink-deep" strokeWidth={1.8} /> : <span className="text-sm font-bold">{item.step}</span> })()}
                </span>
                <div>
                  <p className="text-[10px] font-bold text-pink-deep">قدم {item.step}</p>
                  <p className="font-extrabold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pre-register"
              className="inline-flex rounded-2xl bg-gradient-to-l from-pink-deep to-rose px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
            >
              شروع پیش‌ثبت‌نام
            </Link>
            <Link
              href="/payment/parent/login"
              className="inline-flex rounded-2xl border border-navy/15 bg-card px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-muted/50"
            >
              ورود اولیا
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
