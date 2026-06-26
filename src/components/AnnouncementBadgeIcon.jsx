export default function AnnouncementBadgeIcon() {
  return (
    <span className="announcement-badge relative flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-9 w-9 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="announcementBadgeGrad" x1="12" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde68a" />
            <stop offset="0.45" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
          <linearGradient id="announcementBadgeShine" x1="16" y1="14" x2="24" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="announcementBadgeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle className="announcement-pulse-ring announcement-pulse-ring-2" cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.2" />
        <circle className="announcement-pulse-ring announcement-pulse-ring-1" cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.2" />

        <circle className="announcement-core-glow" cx="20" cy="20" r="9" fill="#fbbf24" />

        <g className="announcement-star-main" filter="url(#announcementBadgeGlow)">
          <path
            d="M20 11.5 22.1 17.9 28.5 18.2 23.4 22.4 25.1 28.7 20 25.2 14.9 28.7 16.6 22.4 11.5 18.2 17.9 17.9Z"
            fill="url(#announcementBadgeGrad)"
          />
          <path
            d="M20 14.2 21.2 18.4 25.4 18.7 22.1 21.4 23.2 25.6 20 23.3 16.8 25.6 17.9 21.4 14.6 18.7 18.8 18.4Z"
            fill="url(#announcementBadgeShine)"
          />
        </g>

        <g className="announcement-sparkle announcement-sparkle-1">
          <path d="M33 12 33.6 13.8 35.5 14.4 33.6 15 33 16.8 32.4 15 30.5 14.4 32.4 13.8Z" fill="#fde68a" />
        </g>
        <g className="announcement-sparkle announcement-sparkle-2">
          <path d="M8 26 8.5 27.4 9.9 27.9 8.5 28.4 8 29.8 7.5 28.4 6.1 27.9 7.5 27.4Z" fill="#fff" />
        </g>
        <g className="announcement-sparkle announcement-sparkle-3">
          <path d="M30 30 30.4 31.1 31.5 31.5 30.4 31.9 30 33 29.6 31.9 28.5 31.5 29.6 31.1Z" fill="#fbcfe8" />
        </g>
      </svg>
    </span>
  )
}
