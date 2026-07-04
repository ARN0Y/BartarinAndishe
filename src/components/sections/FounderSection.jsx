import SectionShell from './SectionShell'
import ProfilePortrait from './ProfilePortrait'
import ContactStrip from './ContactStrip'
import CheckList from './CheckList'
import { founderInfo } from '../../data/homeSections'
import { tenureLabel } from '@/lib/tenure'

export default function FounderSection({ info: infoOverride }) {
  const info = infoOverride || founderInfo
  const yearsExperience = info.yearsExperience?.trim() ? info.yearsExperience : tenureLabel('founder')
  const education = info.education || []
  const highlights = info.highlights || []

  return (
    <SectionShell
      id={info.id}
      badge={info.badge}
      title="معرفی مؤسس کودکستان"
      subtitle="بنیان‌گذار و چهرهٔ علمی کودکستان برترین اندیشه"
      compact
      className="bg-background"
    >
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid lg:grid-cols-[minmax(220px,280px)_1fr]">
          <div className="flex justify-center border-b border-border bg-muted/20 px-4 py-6 sm:px-6 lg:border-b-0 lg:border-l lg:py-8">
            <ProfilePortrait
              src={info.image}
              alt={info.imageAlt}
              objectPosition={info.portraitPosition}
              honorific={info.honorific}
              fullName={info.fullName}
              role={info.role}
              shortIntro={info.shortIntro}
              yearsExperience={yearsExperience}
              accent="founder"
              compact
            />
          </div>

          <div className="space-y-4 p-4 sm:p-6 lg:py-7 lg:pl-7 lg:pr-7">
            <blockquote className="rounded-lg border border-border border-r-4 border-r-amber-400 bg-muted/30 px-4 py-3">
              <p className="text-sm italic leading-7 text-foreground/90">«{info.quote}»</p>
            </blockquote>

            <div className="grid gap-4 md:grid-cols-2">
              <CheckList title="تحصیلات و سوابق علمی" items={education} variant="elegant" compact />
              <CheckList title="سوابق اجرایی و تخصصی" items={highlights} variant="elegant" compact />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/25 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-amber-800">{info.messageTitle}</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground sm:text-sm">{info.messageShort}</p>
              </div>
            </div>

            <ContactStrip phone={info.phone} instagram={info.instagram} variant="elegant" />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
