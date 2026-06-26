export default function SectionShell({ id, badge, title, subtitle, children, className = '', compact = false }) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-4 sm:px-6 lg:px-8 ${compact ? 'py-8 sm:py-10' : 'py-14 sm:py-16'} ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="mx-auto max-w-5xl">
        <header className={`text-center ${compact ? 'mb-5 sm:mb-6' : 'mb-10 sm:mb-12'}`}>
          <div className="section-heading-accent" aria-hidden="true" />
          {badge && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-5 py-2 text-xs font-bold tracking-wide text-pink-deep shadow-sm backdrop-blur-sm sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-deep" aria-hidden />
              {badge}
            </span>
          )}
          <h2
            id={`${id}-title`}
            className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`mx-auto max-w-2xl text-muted-foreground ${compact ? 'mt-2 text-xs leading-6 sm:text-sm' : 'mt-4 text-sm leading-8 sm:text-base'}`}>
              {subtitle}
            </p>
          )}
        </header>
        {children}
      </div>
    </section>
  )
}
