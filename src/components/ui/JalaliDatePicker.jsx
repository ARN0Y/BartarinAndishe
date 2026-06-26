'use client'

const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

function daysInMonth(month) {
  if (!month) return 31
  if (month <= 6) return 31
  if (month <= 11) return 30
  return 29 // اسفند — محافظه‌کارانه
}

const sel = 'flex-1 rounded-2xl border border-pink/30 bg-white px-2 py-3 text-sm outline-none focus:border-pink-deep text-center'

export default function JalaliDatePicker({ value, onChange, yearStart, yearEnd }) {
  const parts = (value || '//')  .split('/')
  const selYear  = parts[0] || ''
  const selMonth = parts[1] ? parseInt(parts[1], 10) : ''
  const selDay   = parts[2] ? parseInt(parts[2], 10) : ''

  function emit(y, m, d) {
    const yy = y  || ''
    const mm = m  ? String(m).padStart(2, '0') : ''
    const dd = d  ? String(d).padStart(2, '0') : ''
    onChange(`${yy}/${mm}/${dd}`)
  }

  const totalDays = daysInMonth(parseInt(selMonth) || 0)
  const years = []
  for (let y = yearEnd; y >= yearStart; y--) years.push(y)

  return (
    // در لایوت RTL، اولین آیتم سمت راست قرار می‌گیرد
    // ترتیب: سال (راست) | ماه (وسط) | روز (چپ)
    <div className="flex gap-2">
      {/* سال */}
      <select
        value={selYear}
        onChange={(e) => emit(e.target.value, selMonth, selDay)}
        className={sel}
      >
        <option value="">سال</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* ماه */}
      <select
        value={selMonth}
        onChange={(e) => emit(selYear, e.target.value, selDay)}
        className={sel}
      >
        <option value="">ماه</option>
        {MONTHS.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* روز */}
      <select
        value={selDay}
        onChange={(e) => emit(selYear, selMonth, e.target.value)}
        className={sel}
      >
        <option value="">روز</option>
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  )
}
