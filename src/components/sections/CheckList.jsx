export default function CheckList({ title, items, variant = 'default', compact = false }) {
  if (!items?.length) return null

  const isElegant = variant === 'elegant'
  const pad = compact ? 'p-3' : 'p-5'
  const spacing = compact ? 'space-y-1.5' : 'space-y-3'
  const textSize = compact ? 'text-xs leading-6' : 'text-sm leading-7 sm:text-[0.95rem]'

  return (
    <div className={isElegant ? `rounded-lg border border-border bg-muted/25 ${pad} shadow-sm` : ''}>
      {title && (
        <h4 className={`flex items-center gap-2 font-bold text-foreground ${compact ? 'mb-2 text-xs' : 'mb-4 text-sm'}`}>
          {isElegant && <span className="h-3.5 w-1 rounded-full bg-gradient-to-b from-pink-deep to-rose" aria-hidden />}
          {title}
        </h4>
      )}
      <ul className={spacing}>
        {items.map((item) => (
          <li key={item} className={`flex gap-2 ${textSize} text-muted-foreground`}>
          <span
            className={
              isElegant
                  ? `mt-0.5 flex shrink-0 items-center justify-center rounded-md bg-pink-deep text-[9px] font-bold text-white ${compact ? 'h-4 w-4' : 'h-5 w-5'}`
                  : 'mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-deep to-rose text-[10px] text-white shadow-sm'
            }
            >
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
