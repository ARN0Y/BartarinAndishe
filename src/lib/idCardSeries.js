/** سری شناسنامه — «ا» به «الف» (همان‌طور که روی شناسنامه چاپ شده) */
export function normalizeIdCardSeries(value) {
  const v = String(value || '').trim()
  if (v === 'ا') return 'الف'
  return v
}
