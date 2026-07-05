import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { config } from '@/lib/config'
import { formatCurrency } from '@/lib/formatters'
import { requestPayment, verifyPayment } from '@/lib/payments/zarinpal'
import {
  generateOtp, hashOtp, sendOtp, isSmsConfigured, normalizePhone, isValidMobile,
} from '@/lib/services/smsService'

const OTP_TTL_MS = 3 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5

const key = (excursionId, studentId) => ({ excursionId_studentId: { excursionId: Number(excursionId), studentId } })

function statusOf(consent, excursion) {
  return {
    signed: Boolean(consent?.consentAccepted && consent?.parentSignatureUrl),
    otpVerified: Boolean(consent?.phoneVerifiedAt),
    paid: consent?.paymentStatus === 'Success',
    paymentStatus: consent?.paymentStatus || 'Unpaid',
    phone: consent?.phone || null,
    signerRole: consent?.signerRole || null,
    parentSignatureUrl: consent?.parentSignatureUrl || null,
    completed: Boolean(consent?.phoneVerifiedAt && consent?.paymentStatus === 'Success'),
  }
}

export async function getParentExcursions(studentId) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw new AppError(404, 'نوآموز یافت نشد.')
  const excursions = await prisma.excursion.findMany({
    where: { academicYear: student.academicYear, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  const consents = excursions.length
    ? await prisma.excursionConsent.findMany({ where: { studentId, excursionId: { in: excursions.map((e) => e.id) } } })
    : []
  const byExc = new Map(consents.map((c) => [c.excursionId, c]))
  return excursions.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description || '',
    costRial: e.costRial,
    costFormatted: formatCurrency(e.costRial),
    status: statusOf(byExc.get(e.id), e),
  }))
}

async function loadActive(excursionId, studentId) {
  const excursion = await prisma.excursion.findUnique({ where: { id: Number(excursionId) } })
  if (!excursion || !excursion.isActive) throw new AppError(404, 'اردو یافت نشد یا غیرفعال است.')
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw new AppError(404, 'نوآموز یافت نشد.')
  if (excursion.academicYear !== student.academicYear) {
    throw new AppError(403, 'این اردو مربوط به سال تحصیلی نوآموز نیست.')
  }
  return { excursion, student }
}

/** ثبت امضای الکترونیکی + پذیرش رضایت‌نامه و ارسال کد تایید پیامکی */
export async function signExcursionConsent(studentId, excursionId, { signerRole, parentSignatureUrl, consentAccepted, phone }) {
  const { excursion, student } = await loadActive(excursionId, studentId)
  if (!consentAccepted) throw new AppError(400, 'پذیرش متن رضایت‌نامه الزامی است.')
  const sig = String(parentSignatureUrl || '').trim()
  if (!sig) throw new AppError(400, 'بارگذاری امضای الکترونیکی الزامی است.')
  if (!isValidMobile(phone)) throw new AppError(422, 'شمارهٔ موبایل معتبر (با ۰۹ شروع شود) وارد کنید.')
  const normPhone = normalizePhone(phone)

  const existing = await prisma.excursionConsent.findUnique({ where: key(excursion.id, studentId) })
  if (existing?.paymentStatus === 'Success') {
    throw new AppError(409, 'رضایت‌نامه و پرداخت این اردو قبلاً تکمیل شده است.')
  }

  const code = generateOtp()
  const data = {
    academicYear: student.academicYear,
    signerRole: signerRole === 'mother' ? 'mother' : 'father',
    parentSignatureUrl: sig,
    consentAccepted: true,
    signedAt: new Date(),
    phone: normPhone,
    otpHash: hashOtp(code),
    otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    otpAttempts: 0,
    phoneVerifiedAt: null,
    amountRial: excursion.costRial,
  }
  if (existing) {
    await prisma.excursionConsent.update({ where: { id: existing.id }, data })
  } else {
    await prisma.excursionConsent.create({ data: { excursionId: excursion.id, studentId, ...data } })
  }

  const sms = await sendOtp(normPhone, code)
  return {
    ok: true,
    otpSent: sms.sent,
    smsConfigured: isSmsConfigured(),
    devCode: (!sms.sent && process.env.NODE_ENV !== 'production') ? code : undefined,
    phone: normPhone,
  }
}

/** بررسی کد تایید پیامکی */
export async function verifyExcursionOtp(studentId, excursionId, { code }) {
  const consent = await prisma.excursionConsent.findUnique({ where: key(excursionId, studentId) })
  if (!consent || !consent.consentAccepted) throw new AppError(400, 'ابتدا رضایت‌نامه را امضا کنید.')
  if (consent.phoneVerifiedAt) return { ok: true, alreadyVerified: true }
  if (!consent.otpHash || !consent.otpExpiresAt || consent.otpExpiresAt.getTime() < Date.now()) {
    throw new AppError(400, 'کد تایید منقضی شده است؛ لطفاً دوباره کد جدید درخواست کنید.')
  }
  if (consent.otpAttempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(429, 'تعداد تلاش بیش از حد مجاز؛ لطفاً کد جدید درخواست کنید.')
  }
  const ok = consent.otpHash === hashOtp(String(code || '').trim())
  if (!ok) {
    await prisma.excursionConsent.update({ where: { id: consent.id }, data: { otpAttempts: { increment: 1 } } })
    throw new AppError(401, 'کد تایید نادرست است.')
  }
  await prisma.excursionConsent.update({
    where: { id: consent.id },
    data: { phoneVerifiedAt: new Date(), otpHash: null, otpExpiresAt: null },
  })
  return { ok: true }
}

/** شروع پرداخت الکترونیکی اردو (زرین‌پال) — مجزا از حساب شهریه */
export async function startExcursionPayment(studentId, excursionId) {
  const { excursion, student } = await loadActive(excursionId, studentId)
  const consent = await prisma.excursionConsent.findUnique({ where: key(excursion.id, studentId) })
  if (!consent || !consent.consentAccepted || !consent.parentSignatureUrl) {
    throw new AppError(400, 'ابتدا رضایت‌نامه را امضا کنید.')
  }
  if (!consent.phoneVerifiedAt) throw new AppError(400, 'ابتدا کد تایید پیامکی را وارد کنید.')
  if (consent.paymentStatus === 'Success') return { alreadyPaid: true }
  if (!excursion.costRial || excursion.costRial < 1000) {
    throw new AppError(400, 'مبلغ اردو برای پرداخت آنلاین نامعتبر است.')
  }

  const trackingId = `EX-${excursion.id}-${Date.now()}-${randomUUID().slice(0, 8)}`
  const callbackUrl = `${config.appUrl}/api/payments/excursion/verify`
  const { authority, paymentUrl } = await requestPayment({
    amount: excursion.costRial,
    description: `هزینه اردو «${excursion.title}» — ${student.firstName} ${student.lastName}`,
    callbackUrl,
    metadata: { excursionId: excursion.id, studentId, kind: 'excursion' },
  })
  await prisma.excursionConsent.update({
    where: { id: consent.id },
    data: { paymentStatus: 'Pending', paymentTrackingId: trackingId, zarinpalAuthority: authority, amountRial: excursion.costRial },
  })
  return { paymentUrl, authority }
}

/** تکمیل پرداخت پس از بازگشت از زرین‌پال */
export async function completeExcursionPayment(authority, statusParam) {
  const consent = await prisma.excursionConsent.findUnique({
    where: { zarinpalAuthority: authority },
    include: { excursion: true, student: { select: { id: true } } },
  })
  if (!consent) throw new AppError(404, 'تراکنش یافت نشد.')
  if (consent.paymentStatus === 'Success') return { success: true, consent }

  if (statusParam !== 'OK') {
    await prisma.excursionConsent.update({ where: { id: consent.id }, data: { paymentStatus: 'Unpaid' } })
    return { success: false, consent }
  }

  const verification = await verifyPayment({
    amount: consent.amountRial || consent.excursion.costRial,
    authority,
  })
  if (!verification.success) {
    await prisma.excursionConsent.update({ where: { id: consent.id }, data: { paymentStatus: 'Unpaid' } })
    return { success: false, consent }
  }

  const updated = await prisma.excursionConsent.updateMany({
    where: { id: consent.id, paymentStatus: 'Pending' },
    data: { paymentStatus: 'Success', zarinpalRefId: verification.refId, paidAt: new Date() },
  })
  return { success: updated.count > 0, consent, refId: verification.refId }
}
