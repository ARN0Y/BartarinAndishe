import SectionShell from './SectionShell'
import { staffMembers } from '../../data/homeSections'

function StaffCard({ member }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-md shadow-navy/10 ring-2 ring-pink/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-pink/40">
      <div className="flex items-center gap-4 bg-gradient-to-l from-pink-soft to-white px-5 py-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-2xl shadow-inner ring-2 ring-pink/30"
          aria-hidden="true"
        >
          {member.emoji}
        </span>
        <div>
          <h3 className="font-bold text-foreground">{member.name}</h3>
          <p className="text-xs font-semibold text-pink-deep sm:text-sm">{member.role}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <p className="rounded-xl bg-navy/5 px-3 py-2 text-xs font-medium text-foreground sm:text-sm">
          تخصص: {member.specialty}
        </p>
        <p className="flex-1 text-sm leading-7 text-navy-light">{member.bio}</p>
      </div>
    </article>
  )
}

export default function StaffSection() {
  return (
    <SectionShell
      id="staff"
      badge="تیم آموزشی"
      title="معرفی پرسنل کودکستان"
      subtitle="مربیان و همکاران متخصص که هر روز همراه نوآموزان شما هستند"
      className="bg-gradient-to-b from-pink-soft/50 to-white/80"
    >
      <div className="mb-8 rounded-2xl border border-pink/25 bg-white/80 px-5 py-4 text-center text-sm leading-7 text-navy-light sm:text-base">
        تمامی پرسنل پس از مصاحبه تخصصی، بررسی سوابق و گذراندن دوره‌های بازآموزی منظم در
        کودکستان فعالیت می‌کنند. نام و تصویر واقعی هر همکار را می‌توانید در فایل{' '}
        <code className="rounded bg-pink-soft px-1.5 text-foreground">homeSections.js</code> ویرایش
        کنید.
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {staffMembers.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'نسبت مربی به کودک', value: '۱ به ۸', desc: 'در کلاس‌های پیش‌دبستانی' },
          { label: 'بازآموزی سالانه', value: '۴۰+ ساعت', desc: 'کارگاه‌های تربیتی و آموزشی' },
          { label: 'نظارت روزانه', value: 'مداوم', desc: 'توسط مدیر و مؤسس' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-navy px-4 py-5 text-center text-white shadow-lg"
          >
            <p className="text-2xl font-bold text-pink">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold">{stat.label}</p>
            <p className="mt-1 text-xs text-pink-soft/80">{stat.desc}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
