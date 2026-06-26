'use client'

/** ابر شناور — SVG سبک کارتونی */
export function FloatingCloud({ className = '', size = 'md', delay = 0 }) {
  const sizes = {
    sm: 'w-16 h-10',
    md: 'w-24 h-14',
    lg: 'w-32 h-18',
  }
  return (
    <svg
      viewBox="0 0 120 70"
      className={`pointer-events-none select-none ${sizes[size]} ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      <ellipse cx="60" cy="45" rx="52" ry="22" fill="white" opacity="0.92" />
      <ellipse cx="38" cy="38" rx="26" ry="20" fill="white" opacity="0.95" />
      <ellipse cx="82" cy="36" rx="28" ry="18" fill="white" opacity="0.95" />
      <ellipse cx="58" cy="28" rx="22" ry="16" fill="white" />
    </svg>
  )
}

/** خورشید — گوشه فریم */
export function SunnyCorner({ className = '' }) {
  return (
    <svg viewBox="0 0 80 80" className={`pointer-events-none w-14 h-14 sm:w-16 sm:h-16 ${className}`} aria-hidden>
      <circle cx="40" cy="40" r="16" fill="#FFE066" />
      <circle cx="40" cy="40" r="13" fill="#FFD93D" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="40"
          y1="40"
          x2={40 + 26 * Math.cos((deg * Math.PI) / 180)}
          y2={40 + 26 * Math.sin((deg * Math.PI) / 180)}
          stroke="#FFD93D"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

/** رنگین‌کمان — بالای فریم */
export function RainbowArc({ className = '' }) {
  return (
    <svg viewBox="0 0 200 60" className={`pointer-events-none w-36 sm:w-44 h-10 ${className}`} aria-hidden>
      <path d="M 10 55 A 90 90 0 0 1 190 55" fill="none" stroke="#FFB3BA" strokeWidth="6" strokeLinecap="round" />
      <path d="M 22 55 A 78 78 0 0 1 178 55" fill="none" stroke="#FFDFBA" strokeWidth="6" strokeLinecap="round" />
      <path d="M 34 55 A 66 66 0 0 1 166 55" fill="none" stroke="#FFFFBA" strokeWidth="6" strokeLinecap="round" />
      <path d="M 46 55 A 54 54 0 0 1 154 55" fill="none" stroke="#BAFFC9" strokeWidth="6" strokeLinecap="round" />
      <path d="M 58 55 A 42 42 0 0 1 142 55" fill="none" stroke="#BAE1FF" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/** موج نرم — پایین تصویر */
export function SoftWave({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute bottom-0 left-0 w-full h-10 sm:h-12 ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden
    >
      <path
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
        fill="white"
        fillOpacity="0.85"
      />
      <path
        d="M0,50 C360,90 720,10 1080,50 C1260,70 1380,55 1440,50 L1440,80 L0,80 Z"
        fill="white"
        fillOpacity="0.5"
      />
    </svg>
  )
}

/** حباب‌های رنگی پس‌زمینه */
export function PastelBlobs({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="absolute top-1/3 -left-20 h-48 w-48 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="absolute -bottom-10 right-1/4 h-40 w-40 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />
    </div>
  )
}

/** ستاره/براق کوچک */
export function Sparkle({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={`pointer-events-none w-4 h-4 text-yellow-300 ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M12 0l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 19l2.3-7-6-4.6h7.6z"
      />
    </svg>
  )
}

export const ACCENT_THEMES = {
  pink: {
    frame: 'from-pink-100 via-rose-50 to-pink-soft',
    ring: 'ring-pink-200/80',
    overlay: 'from-pink-300/15 via-transparent to-rose-200/10',
    glow: 'bg-pink-300/25',
    dot: 'bg-pink-400',
    label: 'bg-pink-100 text-pink-700',
  },
  sky: {
    frame: 'from-sky-100 via-blue-50 to-cyan-50',
    ring: 'ring-sky-200/80',
    overlay: 'from-sky-300/15 via-transparent to-cyan-200/10',
    glow: 'bg-sky-300/25',
    dot: 'bg-sky-400',
    label: 'bg-sky-100 text-sky-700',
  },
  yellow: {
    frame: 'from-yellow-100 via-amber-50 to-orange-50',
    ring: 'ring-yellow-200/80',
    overlay: 'from-yellow-300/12 via-transparent to-amber-200/10',
    glow: 'bg-yellow-300/25',
    dot: 'bg-yellow-400',
    label: 'bg-yellow-100 text-yellow-800',
  },
  green: {
    frame: 'from-emerald-100 via-green-50 to-teal-50',
    ring: 'ring-emerald-200/80',
    overlay: 'from-emerald-300/12 via-transparent to-teal-200/10',
    glow: 'bg-emerald-300/25',
    dot: 'bg-emerald-400',
    label: 'bg-emerald-100 text-emerald-700',
  },
}

/** پرچم‌های رنگی — تزئین کودکانه */
export function BuntingFlags({ className = '' }) {
  const colors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBFF']
  return (
    <svg viewBox="0 0 240 28" className={`pointer-events-none w-48 sm:w-56 h-7 ${className}`} aria-hidden>
      <path d="M4 4 H236" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
      {colors.map((c, i) => (
        <path
          key={i}
          d={`M${12 + i * 38} 4 L${22 + i * 38} 4 L${17 + i * 38} 22 Z`}
          fill={c}
          opacity="0.92"
        />
      ))}
    </svg>
  )
}

/** برچسب گوشه کارت — ستاره، بادکنک، پروانه، قلب */
const STICKERS = {
  star: (
    <svg viewBox="0 0 32 32" className="h-7 w-7 drop-shadow-sm" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="white" fillOpacity="0.95" />
      <path fill="#FFD93D" d="M16 6l2.2 6.8H25l-5.5 4 2.1 6.8L16 19.6l-5.6 4.2 2.1-6.8-5.5-4h6.8z" />
    </svg>
  ),
  balloon: (
    <svg viewBox="0 0 32 32" className="h-7 w-7 drop-shadow-sm" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="white" fillOpacity="0.95" />
      <ellipse cx="16" cy="13" rx="7" ry="9" fill="#FF9EB5" />
      <path d="M16 22v4" stroke="#FF9EB5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  butterfly: (
    <svg viewBox="0 0 32 32" className="h-7 w-7 drop-shadow-sm" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="white" fillOpacity="0.95" />
      <ellipse cx="11" cy="14" rx="5" ry="6" fill="#BAE1FF" />
      <ellipse cx="21" cy="14" rx="5" ry="6" fill="#E0BBFF" />
      <ellipse cx="16" cy="16" rx="1.5" ry="5" fill="#64748B" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 32 32" className="h-7 w-7 drop-shadow-sm" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="white" fillOpacity="0.95" />
      <path fill="#FF6B9D" d="M16 24s-8-5.2-8-10.2C8 10.5 10.5 9 13 9c1.6 0 3 0.8 3.8 2 0.8-1.2 2.2-2 3.8-2 2.5 0 5 1.5 5 4.8C22 18.8 16 24 16 24z" />
    </svg>
  ),
}

const STICKER_KEYS = ['star', 'balloon', 'butterfly', 'heart']

export function CornerSticker({ index = 0, className = '' }) {
  const key = STICKER_KEYS[index % STICKER_KEYS.length]
  return (
    <div className={`pointer-events-none absolute -top-2.5 -right-2.5 z-20 animate-gentle-bob ${className}`} aria-hidden>
      {STICKERS[key]}
    </div>
  )
}

/** نقطه‌های رنگی پس‌زمینه */
export function PlayfulDots({ className = '' }) {
  const dots = [
    { top: '12%', left: '8%', color: 'bg-pink-300', size: 'h-2 w-2' },
    { top: '28%', right: '12%', color: 'bg-sky-300', size: 'h-2.5 w-2.5' },
    { top: '65%', left: '15%', color: 'bg-yellow-300', size: 'h-2 w-2' },
    { top: '78%', right: '20%', color: 'bg-emerald-300', size: 'h-2 w-2' },
    { top: '45%', left: '45%', color: 'bg-violet-300', size: 'h-1.5 w-1.5' },
  ]
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className={`absolute rounded-full opacity-60 ${d.color} ${d.size}`}
          style={{ top: d.top, left: d.left, right: d.right }}
        />
      ))}
    </div>
  )
}

export const ACCENT_KEYS = ['pink', 'sky', 'yellow', 'green']
