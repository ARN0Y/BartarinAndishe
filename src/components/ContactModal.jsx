'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Map, MapPinned, PhoneCall, Smartphone, X } from 'lucide-react'

import { siteContact, BALAD_URL } from '@/data/siteContact'

const CONTACT_ITEMS = [
  {
    id: 'address',
    label: 'آدرس',
    Icon: MapPinned,
    content: (
      <>
        <p className="text-[15px] leading-relaxed text-foreground">
          {siteContact.city} — {siteContact.address}
        </p>
        <a
          href={BALAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Map className="h-4 w-4" strokeWidth={1.8} />
          مشاهده روی نقشه بلد
        </a>
      </>
    ),
  },
  {
    id: 'school-phone',
    label: 'تلفن مدرسه',
    Icon: PhoneCall,
    content: (
      <a
        href={`tel:${siteContact.schoolPhone}`}
        className="block text-lg font-bold text-foreground transition hover:text-pink-deep"
      >
        <span dir="ltr" className="inline-block tabular-nums tracking-wide [unicode-bidi:isolate]">
          {siteContact.schoolPhoneDisplay}
        </span>
      </a>
    ),
  },
  {
    id: 'manager-phone',
    label: 'تلفن مدیریت',
    Icon: Smartphone,
    content: (
      <a
        href={`tel:${siteContact.managerPhone}`}
        className="block text-lg font-bold text-foreground transition hover:text-emerald-600"
      >
        <span dir="ltr" className="inline-block tabular-nums tracking-wide [unicode-bidi:isolate]">
          {siteContact.managerPhoneDisplay}
        </span>
      </a>
    ),
  },
]

export default function ContactModal({ onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن"
      />

      <div className="animate-slide-up relative z-10 flex max-h-[min(90svh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="relative border-b border-border bg-card px-6 pb-6 pt-7 text-center sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
            aria-label="بستن"
            title="بستن"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="relative mx-auto mb-4 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-lg border border-border bg-background p-2.5 shadow-sm sm:h-20 sm:w-20">
            <img
              src="/images/logo.svg"
              alt="لوگوی کودکستان برترین اندیشه"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 id="contact-modal-title" className="relative text-2xl font-extrabold tracking-wide text-foreground">
            تماس با ما
          </h2>
          <p className="relative mt-1.5 text-sm text-muted-foreground">{siteContact.name} — {siteContact.tagline}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-3">
            {CONTACT_ITEMS.map((item) => {
              const Icon = item.Icon
              return (
              <article
                key={item.id}
                className="rounded-lg border border-border bg-muted/30 p-4 shadow-sm transition hover:border-pink-deep/25 hover:bg-accent/50"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background text-pink-deep shadow-sm ring-1 ring-border">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </p>
                    {item.content}
                  </div>
                </div>
              </article>
            )})}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">برای تماس مستقیم روی شماره‌ها کلیک کنید</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
