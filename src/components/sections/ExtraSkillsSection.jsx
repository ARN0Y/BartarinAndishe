import SectionShell from './SectionShell'
import { Sparkles } from 'lucide-react'

export default function ExtraSkillsSection({ items = [] }) {
  if (!items.length) return null

  return (
    <SectionShell
      id="extra-skills"
      badge="فوق‌برنامه"
      title="مهارت‌های فوق‌برنامه"
      subtitle="برنامه‌های تکمیلی برای شکوفایی استعدادهای کودکان"
      compact
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-right shadow-sm transition hover:shadow-md">
            {item.mediaUrl ? (
              <span className="h-32 w-full overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" draggable={false} />
              </span>
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink/10" aria-hidden>
                <Sparkles className="h-6 w-6 text-pink-deep" strokeWidth={1.5} />
              </span>
            )}
            <div>
              <h3 className="font-bold text-foreground">{item.title}</h3>
              {item.body ? <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{item.body}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
