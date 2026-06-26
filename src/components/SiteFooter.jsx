'use client'

import Link from 'next/link'
import { siteContact } from '@/data/siteContact'
import { navItems } from '@/data/navItems'
import {
  MapPin, Phone, Clock, GraduationCap, ArrowLeft, Map, Heart,
} from 'lucide-react'

const quickLinks = navItems.filter((n) => n.id !== 'pre-register')

export default function SiteFooter() {
  const year = new Date().toLocaleDateString('fa-IR', { year: 'numeric' }).replace(/[^۰-۹0-9]/g, '')

  return (
    <footer className="relative mt-auto border-t border-border bg-card/70 backdrop-blur-sm" dir="rtl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-pink-deep via-pink to-gold" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logo.svg" alt={siteContact.name} className="h-12 w-auto" />
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-pink-deep">کودکستان</p>
                <p className="text-base font-extrabold leading-tight text-foreground">برترین اندیشه</p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              محیطی امن، علمی و شاد برای رشد و شکوفایی کودکان شما در مقطع پیش‌دبستانی — با تکیه بر تجربه، مهربانی و پرورش هوش چندگانه.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-pink-deep">
              <GraduationCap className="h-4 w-4" />
              {siteContact.gradeLevels}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="پیوندهای سریع">
            <h3 className="text-sm font-bold text-foreground">دسترسی سریع</h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-pink-deep"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/pre-register"
                  className="mt-1 inline-flex items-center gap-2 rounded-lg bg-pink-deep px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose"
                >
                  پیش ثبت‌نام آنلاین
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-foreground">اطلاعات تماس</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-soft text-pink-deep dark:bg-pink-deep/15">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="leading-7 text-muted-foreground">{siteContact.city} — {siteContact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-soft text-pink-deep dark:bg-pink-deep/15">
                  <Phone className="h-4 w-4" />
                </span>
                <a href={`tel:${siteContact.schoolPhone}`} className="font-semibold text-foreground transition-colors hover:text-pink-deep ltr">
                  {siteContact.schoolPhoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-soft text-pink-deep dark:bg-pink-deep/15">
                  <Clock className="h-4 w-4" />
                </span>
                <span className="text-muted-foreground">ساعت کاری: {siteContact.kindergartenHours}</span>
              </li>
            </ul>
            <a
              href={siteContact.baladUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-pink-deep/40 hover:text-pink-deep"
            >
              <Map className="h-4 w-4" />
              مشاهده روی نقشه بلد
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            © {year} کودکستان برترین اندیشه — همه حقوق محفوظ است.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            ساخته‌شده با
            <Heart className="h-3.5 w-3.5 fill-pink-deep text-pink-deep" />
            برای کودکان اصفهان
          </p>
        </div>
      </div>
    </footer>
  )
}
