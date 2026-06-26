export default function ProfilePortrait({
  src,
  alt,
  objectPosition = '50% 20%',
  honorific,
  fullName,
  role,
  shortIntro,
  yearsExperience,
  accent = 'founder',
  compact = false,
}) {
  const accents = {
    founder: {
      badge: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
      line: 'bg-amber-400',
    },
    manager: {
      badge: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
      line: 'bg-sky-400',
    },
  }
  const a = accents[accent] || accents.founder

  return (
    <figure className={`relative mx-auto flex w-full flex-col items-center ${compact ? 'max-w-[13rem] sm:max-w-[14rem]' : 'max-w-[21rem] sm:max-w-[23rem] lg:max-w-[25rem]'}`}>
      <div className="relative w-full">
        <div className="relative rounded-lg border border-border bg-background p-1.5 shadow-sm sm:p-2">
            <div
              className={`portrait-frame relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-md bg-muted ${compact ? 'max-w-[11rem] sm:max-w-[12rem]' : 'max-w-[18rem] sm:max-w-[19.5rem] lg:max-w-[21rem]'}`}
            >
              <img
                src={src}
                alt={alt}
                className="portrait-photo absolute inset-0 h-full w-full scale-[1.55] object-cover"
                style={{ objectPosition }}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" aria-hidden />
            </div>
        </div>

        <div className={`mx-auto mt-3 h-0.5 w-12 rounded-full ${a.line}`} aria-hidden />
      </div>

      <figcaption className={`w-full text-center ${compact ? 'mt-4' : 'mt-7'}`}>
        {honorific && (
          <p className={`font-bold tracking-wide text-pink-deep/90 ${compact ? 'text-[10px]' : 'text-xs uppercase sm:text-[13px]'}`}>
            {honorific}
          </p>
        )}
        {fullName && (
          <p className={`mt-1 font-extrabold leading-snug text-foreground ${compact ? 'text-base sm:text-lg' : 'mt-2 text-xl sm:text-2xl'}`}>
            {fullName}
          </p>
        )}
        {role && (
          <p className={`mx-auto font-semibold text-muted-foreground ${compact ? 'mt-1 max-w-[12rem] text-[11px] leading-5' : 'mt-2 max-w-[16rem] text-sm leading-relaxed'}`}>
            {role}
          </p>
        )}
        {shortIntro && !compact && (
          <p className="mx-auto mt-4 max-w-[19rem] text-sm leading-8 text-muted-foreground">
            {shortIntro}
          </p>
        )}
        {yearsExperience && (
          <span className={`inline-flex items-center gap-2 rounded-full border font-bold shadow-sm ${compact ? 'mt-2 px-3 py-1 text-[10px]' : 'mt-5 px-5 py-2 text-xs'} ${a.badge}`}>
            {!compact && <span className="h-1.5 w-1.5 rounded-full bg-pink-deep" aria-hidden />}
            {yearsExperience}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
