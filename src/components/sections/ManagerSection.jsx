import SectionShell from './SectionShell'
import ProfilePortrait from './ProfilePortrait'
import ContactStrip from './ContactStrip'
import CheckList from './CheckList'
import { managerInfo } from '../../data/homeSections'
import { tenureLabel } from '@/lib/tenure'
import { Clock3 } from 'lucide-react'

export default function ManagerSection({ info: infoOverride }) {
  const info = infoOverride || managerInfo
  const yearsExperience = info.yearsExperience?.trim() ? info.yearsExperience : tenureLabel('manager')
  const education = info.education || []
  const responsibilities = info.responsibilities || []

  return (
    <SectionShell
      id={info.id}
      badge={info.badge}
      title="معرفی مدیر کودکستان"
      subtitle="راهبر اجرایی و آموزشی کودکستان برترین اندیشه"
      compact
      className="bg-background"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid lg:grid-cols-[1fr_minmax(220px,280px)]">
          <div className="order-2 space-y-4 p-4 sm:p-6 lg:order-1 lg:py-7 lg:pl-7 lg:pr-7">
            <div className="rounded-lg border border-border border-r-4 border-r-sky-400 bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-bold tracking-wide text-sky-700">فلسفه مدیریت</p>
              <p className="mt-1.5 text-sm leading-7 text-foreground/85">{info.philosophy}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CheckList title="تحصیلات و آثار علمی" items={education} variant="elegant" compact />
              <CheckList title="سوابق حرفه‌ای" items={responsibilities} variant="elegant" compact />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ContactStrip phone={info.phone} instagram={info.instagram} variant="elegant" />
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-primary px-3 py-2 text-primary-foreground shadow-sm">
                <Clock3 className="h-4 w-4" strokeWidth={1.8} />
                <p className="text-[11px] font-medium text-white/90">{info.workingHours}</p>
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center border-b border-border bg-muted/20 px-4 py-6 sm:px-6 lg:order-2 lg:border-b-0 lg:border-r lg:py-8">
            <ProfilePortrait
              src={info.image}
              alt={info.imageAlt}
              objectPosition={info.portraitPosition}
              honorific={info.honorific}
              fullName={info.fullName}
              role={info.role}
              shortIntro={info.shortIntro}
              yearsExperience={yearsExperience}
              accent="manager"
              compact
            />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
