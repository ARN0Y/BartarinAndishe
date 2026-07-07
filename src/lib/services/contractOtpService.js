import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import {
  generateOtp, hashOtp, sendOtp, isSmsConfigured, normalizePhone, isValidMobile,
} from '@/lib/services/smsService'

const PURPOSE = 'contract'
const OTP_TTL_MS = 3 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5

const challengeKey = (studentId) => ({ studentId_purpose: { studentId, purpose: PURPOSE } })

export function signerPhoneOf(profile, signerRole) {
  const role = signerRole === 'mother' ? 'mother' : 'father'
  return role === 'mother' ? profile?.motherPhone : profile?.fatherPhone
}

/**
 * ارسال کد تایید پیامکی برای امضای قرارداد شهریه.
 * پیش‌شرط‌ها بررسی می‌شود تا در صورت عدم امکان امضا، کد ارسال نشود.
 */
export async function sendContractOtp(studentId, { signerRole }) {
  const [profile, contract, plan] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { studentId } }),
    prisma.tuitionContract.findUnique({ where: { studentId }, select: { id: true } }),
    prisma.studentFinancialPlan.findUnique({ where: { studentId }, select: { readyForParent: true } }),
  ])

  if (contract) throw new AppError(409, 'قرارداد قبلاً ثبت شده است.')
  if (!profile?.profileCompleted) throw new AppError(403, 'ابتدا فرم تکمیل اطلاعات نوآموز را کامل کنید.')
  if (!plan?.readyForParent) {
    throw new AppError(403, 'قرارداد مالی هنوز توسط مدیریت تکمیل نشده است. لطفاً بعداً مراجعه کنید.')
  }

  const rawPhone = signerPhoneOf(profile, signerRole)
  if (!isValidMobile(rawPhone)) {
    throw new AppError(422, 'شمارهٔ موبایل امضاکننده در فرم ثبت‌نام معتبر نیست؛ ابتدا آن را اصلاح کنید.')
  }
  const phone = normalizePhone(rawPhone)

  const code = generateOtp()
  const data = {
    phone,
    otpHash: hashOtp(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
  }
  await prisma.otpChallenge.upsert({
    where: challengeKey(studentId),
    update: data,
    create: { studentId, purpose: PURPOSE, ...data },
  })

  const sms = await sendOtp(phone, code)
  return {
    ok: true,
    otpSent: sms.sent,
    smsConfigured: isSmsConfigured(),
    devCode: (!sms.sent && process.env.NODE_ENV !== 'production') ? code : undefined,
    phone,
  }
}

/**
 * اعتبارسنجی کد تایید امضای قرارداد (بدون حذف چالش).
 * حذف چالش باید پس از ثبت موفق قرارداد و در همان تراکنش انجام شود
 * تا کد پیش از تکمیل قرارداد مصرف نشود.
 */
export async function verifyContractOtp(studentId, signerPhone, code) {
  const challenge = await prisma.otpChallenge.findUnique({ where: challengeKey(studentId) })
  if (!challenge) throw new AppError(400, 'ابتدا کد تایید پیامکی را دریافت کنید.')

  if (challenge.phone !== normalizePhone(signerPhone)) {
    throw new AppError(400, 'شمارهٔ امضاکننده تغییر کرده است؛ لطفاً دوباره کد تایید دریافت کنید.')
  }
  if (challenge.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, 'کد تایید منقضی شده است؛ لطفاً دوباره کد جدید درخواست کنید.')
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(429, 'تعداد تلاش بیش از حد مجاز؛ لطفاً کد جدید درخواست کنید.')
  }
  const ok = challenge.otpHash === hashOtp(String(code || '').trim())
  if (!ok) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } })
    throw new AppError(401, 'کد تایید نادرست است.')
  }
  return { ok: true }
}

/** حذف چالش OTP قرارداد (پس از ثبت موفق). tx اختیاری برای اجرا درون تراکنش. */
export async function clearContractOtp(studentId, tx = prisma) {
  await tx.otpChallenge.deleteMany({ where: { studentId, purpose: PURPOSE } })
}
