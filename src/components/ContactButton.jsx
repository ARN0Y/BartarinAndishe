'use client'

import { useState } from 'react'
import ContactModal from './ContactModal'
import { ChevronLeft, PhoneCall } from 'lucide-react'

export default function ContactButton({ variant = 'header' }) {
  const [open, setOpen] = useState(false)

  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card/95 px-2.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-pink-deep/30 hover:bg-accent sm:px-3.5"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-pink-deep transition group-hover:bg-pink-deep/10">
            <PhoneCall className="h-3.5 w-3.5" strokeWidth={1.9} />
          </span>
          <span className="hidden sm:inline">تماس با ما</span>
        </button>
        {open && <ContactModal onClose={() => setOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5 text-right shadow-sm transition hover:border-pink-deep/30 hover:bg-accent"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-pink-deep transition group-hover:bg-pink-deep/10">
          <PhoneCall className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="flex-1">
          <span className="block text-base font-extrabold text-foreground">تماس با ما</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">آدرس، تلفن و موقعیت مکانی</span>
        </span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground transition group-hover:text-pink-deep" strokeWidth={1.9} />
      </button>
      {open && <ContactModal onClose={() => setOpen(false)} />}
    </>
  )
}
