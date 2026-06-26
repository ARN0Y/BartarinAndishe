import { Camera, PhoneCall } from 'lucide-react'

export default function ContactStrip({ phone, instagram, variant = 'default' }) {
  if (!phone && !instagram) return null

  const btnBase = variant === 'elegant'
    ? 'inline-flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5'
    : 'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition'

  return (
    <div className="flex flex-wrap justify-start gap-3">
      {phone && (
        <a
          href={`tel:${phone}`}
          className={`${btnBase} border border-border bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15" aria-hidden>
            <PhoneCall className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span dir="ltr">{phone}</span>
        </a>
      )}
      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} border border-border bg-card text-foreground shadow-sm hover:border-pink-deep/35 hover:bg-accent hover:shadow-md`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-pink-deep" aria-hidden>
            <Camera className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span dir="ltr">{instagram}</span>
        </a>
      )}
    </div>
  )
}
