import jalaali from 'jalaali-js'
import { toEnglishDigits as normalizeDigits } from '@/lib/digits'

export function toEnglishDigits(str) {
  return normalizeDigits(str)
}

/** نرمال‌سازی تاریخ شمسی به فرمت YYYY/MM/DD */
export function normalizeJalaliDate(input) {
  if (!input) return ''
  const raw = toEnglishDigits(String(input).trim())

  if (raw.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
      return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
    }
  }

  const str = raw.replace(/-/g, '/')
  const parts = str.split('/')
  if (parts.length !== 3) return str
  const [y, m, d] = parts.map((p) => parseInt(p, 10))
  if (!y || !m || !d) return str
  return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`
}

export function findDuplicateCashPayment(payments, date, amount, excludeId = null) {
  const normDate = normalizeJalaliDate(date)
  const normAmount = Number(amount)
  if (!normDate || !normAmount) return null

  const dup = (payments || []).find((p) => {
    if (excludeId != null && p.id === excludeId) return false
    const pDate = normalizeJalaliDate(p.paymentDate || p.dateFormatted)
    return pDate === normDate && Number(p.amountPaid) === normAmount
  })

  return dup ? { date: normDate, amount: normAmount } : null
}

export function findDuplicateSchedule(schedules, date, amount, excludeId = null) {
  const normDate = normalizeJalaliDate(date)
  const normAmount = Number(amount)
  if (!normDate || !normAmount) return null

  const dup = (schedules || []).find((s) => {
    if (excludeId != null && s.id === excludeId) return false
    const sDate = normalizeJalaliDate(s.checkDate || s.dueDate)
    return sDate === normDate && Number(s.amountDue) === normAmount
  })

  return dup ? { date: normDate, amount: normAmount } : null
}

export function confirmDuplicateWarning(duplicate, typeLabel) {
  if (!duplicate) return true
  if (typeof window === 'undefined') return true
  const amountFmt = Number(duplicate.amount).toLocaleString('en-US')
  return window.confirm(
    `⚠️ هشدار تکراری\n\n${typeLabel} با تاریخ «${duplicate.date}» و مبلغ «${amountFmt} ریال» قبلاً ثبت شده است.\n\nآیا مطمئن هستید می‌خواهید دوباره ثبت کنید؟`
  )
}

/** ارسال POST با تأیید مجدد در صورت 409 — فقط کلاینت */
export async function postFinanceWithDuplicateRetry(url, body) {
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let json = await res.json()
  if (res.status === 409 && json.duplicate) {
    const typeLabel = url.includes('manual-payments') ? 'پرداخت نقدی' : 'قسط'
    const date = body.paymentDate || body.checkDate || body.dueDate
    const amount = body.amountPaid ?? body.amountDue
    if (!confirmDuplicateWarning({ date, amount }, typeLabel)) {
      return { ok: false, json, cancelled: true }
    }
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, forceDuplicate: true }),
    })
    json = await res.json()
  }
  return { ok: res.ok, json }
}

/** ارسال PATCH با تأیید مجدد در صورت 409 — فقط کلاینت */
export async function patchFinanceWithDuplicateRetry(url, body, duplicateInfo, typeLabel) {
  let res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let json = await res.json().catch(() => ({}))
  if (res.status === 409 && json.duplicate) {
    if (!confirmDuplicateWarning(duplicateInfo, typeLabel)) {
      return { ok: false, cancelled: true }
    }
    res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, forceDuplicate: true }),
    })
    json = await res.json().catch(() => ({}))
  }
  return { ok: res.ok, json }
}

/** بررسی تکراری در دیتابیس — سرور */
export async function findDuplicateCashInDb(prisma, studentId, paymentDate, amountPaid, excludeId = null) {
  const start = new Date(paymentDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const existing = await prisma.manualPayment.findFirst({
    where: {
      studentId: Number(studentId),
      amountPaid: Number(amountPaid),
      paymentDate: { gte: start, lt: end },
      ...(excludeId ? { NOT: { id: Number(excludeId) } } : {}),
    },
  })
  return existing
}

export async function findDuplicateScheduleInDb(prisma, studentId, dateStr, amountDue, excludeId = null) {
  const normDate = normalizeJalaliDate(dateStr)
  const schedules = await prisma.paymentSchedule.findMany({
    where: {
      studentId: Number(studentId),
      amountDue: Number(amountDue),
      ...(excludeId ? { NOT: { id: Number(excludeId) } } : {}),
    },
  })

  return schedules.find((s) => normalizeJalaliDate(s.checkDate || s.dueDate) === normDate) || null
}
