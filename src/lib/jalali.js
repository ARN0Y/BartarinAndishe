import jalaali from 'jalaali-js'
import { toEnglishDigits } from '@/lib/digits'
import { AppError } from '@/lib/errors'

/**
 * Convert a Jalali string "YYYY/MM/DD" to a Gregorian Date object
 */
export function jalaliToDate(jStr) {
  const parts = toEnglishDigits(jStr).replace(/-/g, '/').split('/')
  if (parts.length !== 3) throw new AppError(422, 'فرمت تاریخ شمسی نادرست است (مثال: ۱۴۰۳/۰۸/۱۵)')
  const [jy, jm, jd] = parts.map((p) => {
    const n = parseInt(p, 10)
    if (isNaN(n)) throw new AppError(422, 'تاریخ شمسی نامعتبر است.')
    return n
  })
  if (!jalaali.isValidJalaaliDate(jy, jm, jd)) {
    throw new AppError(422, 'تاریخ شمسی نامعتبر است.')
  }
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

/**
 * Convert a Gregorian Date to Jalali string "YYYY/MM/DD"
 */
export function dateToJalali(date) {
  const d = new Date(date)
  const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

/** تاریخ و ساعت شمسی برای چاپ — مثال: 1405/03/07 — 6:58 ق.ظ */
export function formatJalaliDateTime(date = new Date()) {
  const d = new Date(date)
  const datePart = dateToJalali(d)
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const hour24 = d.getHours()
  const hour12 = hour24 % 12 || 12
  const ampm = hour24 < 12 ? 'ق.ظ' : 'ب.ظ'
  return `${datePart} — ${hour12}:${minutes} ${ampm}`
}

/**
 * Convert a Rial amount to Toman string with Persian formatting
 */
export function rialToTomanFa(rialAmount) {
  const n = Number(rialAmount)
  if (!n || isNaN(n)) return ''
  const toman = Math.floor(n / 10)
  return new Intl.NumberFormat('fa-IR').format(toman) + ' تومان'
}
