'use client'

// بادکنک‌های رنگی کوچک و شکل‌های شاد — تزئین کودکانهٔ صفحهٔ اصلی (بدون تداخل با کلیک‌ها)
const BALLOONS = [
  { left: '4%', color: '#f472b6', delay: '0s', dur: '13s', size: 26 },
  { left: '16%', color: '#60a5fa', delay: '3s', dur: '16s', size: 20 },
  { left: '34%', color: '#fbbf24', delay: '6s', dur: '14s', size: 30 },
  { left: '62%', color: '#34d399', delay: '1.5s', dur: '17s', size: 22 },
  { left: '78%', color: '#a78bfa', delay: '4.5s', dur: '15s', size: 28 },
  { left: '90%', color: '#fb7185', delay: '8s', dur: '18s', size: 18 },
]

function Balloon({ left, color, delay, dur, size }) {
  return (
    <span
      className="kid-balloon"
      style={{ left, animationDelay: delay, animationDuration: dur }}
      aria-hidden
    >
      <svg width={size} height={size * 1.3} viewBox="0 0 30 39" fill="none">
        <ellipse cx="15" cy="14" rx="13" ry="14" fill={color} opacity="0.85" />
        <ellipse cx="11" cy="9" rx="3.5" ry="4.5" fill="#ffffff" opacity="0.45" />
        <path d="M15 28 L13 31 L17 31 Z" fill={color} opacity="0.85" />
        <path d="M15 31 C15 34 18 35 15 39" stroke={color} strokeWidth="1" opacity="0.6" fill="none" />
      </svg>
    </span>
  )
}

export default function KidDecorations() {
  return (
    <div className="kid-decorations pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {BALLOONS.map((b, i) => (
        <Balloon key={i} {...b} />
      ))}
    </div>
  )
}
