import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { onlyEnglishDigits } from '@/lib/digits'

/** بازنشانی رمز والد به کد ملی نوآموز (فراموشی رمز) — رمز سفارشی پاک می‌شود */
export async function resetParentPasswordToNationalId(nationalId) {
  const normalized = onlyEnglishDigits(nationalId)
  if (!/^\d{10}$/.test(normalized)) {
    throw new AppError(422, 'کد ملی باید ۱۰ رقم باشد.')
  }
  const result = await prisma.student.updateMany({
    where: { nationalId: normalized },
    data: { parentPasswordHash: null, parentPasswordKey: null },
  })
  if (result.count === 0) {
    throw new AppError(404, 'کد ملی نوآموز در سامانه یافت نشد.')
  }
  return { ok: true, count: result.count }
}

// محدودهٔ حروف (فارسی/انگلیسی) و ارقام (فارسی/انگلیسی) مجاز در رمز
const LETTER_RE = /[A-Za-z؀-ۿ]/
const DIGIT_RE = /[0-9۰-۹]/
const ALLOWED_RE = /^[A-Za-z؀-ۿ0-9۰-۹]+$/

/** اثرانگشت یکتای رمز برای جلوگیری از تکراری‌بودن بین نوآموزان */
export function passwordFingerprint(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex')
}

/** اعتبارسنجی رمز جدید انتخابی والد */
export function validateNewPassword(password) {
  const value = String(password || '')
  if (value.length < 6) throw new AppError(422, 'رمز عبور باید حداقل ۶ کاراکتر باشد.')
  if (!ALLOWED_RE.test(value)) throw new AppError(422, 'رمز عبور فقط می‌تواند شامل حروف و اعداد باشد.')
  if (!LETTER_RE.test(value) || !DIGIT_RE.test(value)) {
    throw new AppError(422, 'رمز عبور باید ترکیبی از حروف و اعداد باشد.')
  }
  return value
}

/**
 * بررسی رمز هنگام ورود.
 * اگر رمز سفارشی تنظیم نشده باشد (parentPasswordHash خالی) رمز = کد ملی نوآموز است.
 */
export async function verifyParentPassword(student, password) {
  const provided = String(password ?? '')
  if (!student.parentPasswordHash) {
    return provided === String(student.nationalId)
  }
  return bcrypt.compare(provided, student.parentPasswordHash)
}

export function hasCustomPassword(student) {
  return Boolean(student?.parentPasswordHash)
}

/** تغییر رمز توسط والد — با اعتبارسنجی و کنترل یکتایی */
export async function changeParentPassword(studentId, { currentPassword, newPassword }) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw new AppError(404, 'نوآموز یافت نشد.')

  const currentOk = await verifyParentPassword(student, currentPassword)
  if (!currentOk) throw new AppError(401, 'رمز فعلی نادرست است.')

  const clean = validateNewPassword(newPassword)
  if (clean === String(student.nationalId)) {
    throw new AppError(422, 'رمز جدید نباید همان کد ملی باشد.')
  }

  const fingerprint = passwordFingerprint(clean)
  const duplicate = await prisma.student.findFirst({
    where: { parentPasswordKey: fingerprint, NOT: { id: studentId } },
    select: { id: true },
  })
  if (duplicate) {
    throw new AppError(409, 'این رمز برای شخص دیگری تعریف شده است؛ لطفاً رمز دیگری وارد کنید.')
  }

  const hash = await bcrypt.hash(clean, 10)
  await prisma.student.update({
    where: { id: studentId },
    data: { parentPasswordHash: hash, parentPasswordKey: fingerprint },
  })
  return { ok: true }
}
