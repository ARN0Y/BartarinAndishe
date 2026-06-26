import jalaali from 'jalaali-js'

/**
 * سابقهٔ خدمت مدیر و مؤسس به‌صورت خودکار هر سال یک سال اضافه می‌شود.
 * مبنا: در سال شمسی ۱۴۰۵ (پس از ۳۱ اردیبهشت) سابقهٔ مدیر ۲۵ و سابقهٔ مؤسس ۳۳ سال است.
 * نقطهٔ افزایش هر سال: ۳۱ اردیبهشت.
 */
const BASE_JALALI_YEAR = 1405
const FLIP_MONTH = 2 // اردیبهشت
const FLIP_DAY = 31

export const TENURE_BASE = { manager: 25, founder: 33 }

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
export function toPersianDigits(value) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)])
}

/** سال شمسیِ مؤثر برای محاسبهٔ سابقه — قبل از ۳۱ اردیبهشت، سال قبل محسوب می‌شود */
export function effectiveTenureYear(date = new Date()) {
  const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const passedFlip = jm > FLIP_MONTH || (jm === FLIP_MONTH && jd >= FLIP_DAY)
  return passedFlip ? jy : jy - 1
}

/** تعداد سال سابقه برای نقش manager یا founder */
export function tenureYears(role, date = new Date()) {
  const base = TENURE_BASE[role]
  if (base == null) return null
  const added = Math.max(0, effectiveTenureYear(date) - BASE_JALALI_YEAR)
  return base + added
}

/** متن کامل نشان سابقه — مثال: «۲۵ سال سابقه درخشان در آموزش و پرورش» */
export function tenureLabel(role, date = new Date()) {
  const years = tenureYears(role, date)
  if (years == null) return ''
  return `${toPersianDigits(years)} سال سابقه درخشان در آموزش و پرورش`
}
