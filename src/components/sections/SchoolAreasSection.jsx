import SectionShell from './SectionShell'
import { schoolAreas } from '../../data/homeSections'
import {
  School, TreePine, Paintbrush, BookOpen, UtensilsCrossed, Moon,
  Shield, Sparkles, ClipboardList, Users,
} from 'lucide-react'

const AREA_ICONS = { School, TreePine, Paintbrush, BookOpen, UtensilsCrossed, Moon }

const STAT_ITEMS = [
  { Icon: Shield, title: 'ایمنی', text: 'نظارت مداوم و استانداردهای بهداشتی' },
  { Icon: Sparkles, title: 'بهداشت', text: 'ضدعفونی روزانه و آموزش بهداشت فردی' },
  { Icon: ClipboardList, title: 'برنامه روزانه', text: 'زمان‌بندی منظم آموزش، بازی و استراحت' },
  { Icon: Users, title: 'همکاری با خانواده', text: 'گزارش منظم و جلسات حضوری' },
]

function AreaCard({ area, index }) {
  const AreaIcon = area.iconName ? AREA_ICONS[area.iconName] : null

  return (
    <article
      className={[
        'group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md',
        index % 2 === 1 ? 'lg:flex-row-reverse' : '',
        'lg:flex lg:items-stretch',
      ].join(' ')}
    >
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:w-2/5">
        <img
          src={area.image}
          alt={area.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {AreaIcon && (
          <span className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-card/90 shadow-sm backdrop-blur-sm ring-1 ring-border">
            <AreaIcon className="h-5 w-5 text-pink-deep" strokeWidth={1.8} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-foreground sm:text-xl">{area.title}</h3>
        <p className="text-sm leading-8 text-muted-foreground sm:text-base">{area.description}</p>
        <ul className="flex flex-wrap gap-2">
          {area.features.map((feature) => (
            <li
              key={feature}
              className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-foreground sm:text-sm"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default function SchoolAreasSection() {
  return (
    <SectionShell
      id="school-sections"
      badge="فضاهای کودکستان"
      title="آشنایی با قسمت‌های مختلف کودکستان"
      subtitle="مروری بر محیط‌های آموزشی، بازی، استراحت و فعالیت‌های روزانه نوآموزان"
    >
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-4 text-center transition hover:shadow-sm"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <item.Icon className="h-5 w-5 text-pink-deep" strokeWidth={1.8} />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">{item.title}</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {schoolAreas.map((area, index) => (
          <AreaCard key={area.id} area={area} index={index} />
        ))}
      </div>
    </SectionShell>
  )
}
