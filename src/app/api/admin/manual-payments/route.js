import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { addManualPayment } from '@/lib/services/manualPaymentService'
import { jalaliToDate } from '@/lib/jalali'
import { findDuplicateCashInDb, normalizeJalaliDate } from '@/lib/financeDuplicates'
import { onlyEnglishDigits, toEnglishDigits } from '@/lib/digits'

export async function POST(request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { studentId, amountPaid, paymentDate, description, checkNumber, checkDate, bankName, bankBranch, checkOwner, sayadiNumber, forceDuplicate } = body
    const normalizedAmount = onlyEnglishDigits(amountPaid)
    const normalizedPaymentDate = toEnglishDigits(paymentDate)

    if (!studentId || !normalizedAmount || !normalizedPaymentDate) {
      return Response.json({ message: 'اطلاعات ناقص است.' }, { status: 422 })
    }

    const numAmount = Number(normalizedAmount)
    if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 999_999_999_999) {
      return Response.json({ message: 'مبلغ نامعتبر است.' }, { status: 422 })
    }

    const parsedDate = jalaliToDate(normalizedPaymentDate)

    if (!forceDuplicate) {
      const dup = await findDuplicateCashInDb(prisma, studentId, parsedDate, normalizedAmount)
      if (dup) {
        return Response.json({
          message: `پرداخت نقدی با تاریخ «${normalizeJalaliDate(normalizedPaymentDate)}» و مبلغ «${numAmount.toLocaleString('en-US')} ریال» قبلاً ثبت شده است.`,
          duplicate: true,
        }, { status: 409 })
      }
    }

    const payment = await addManualPayment({
      studentId: Number(studentId),
      amountPaid: numAmount,
      paymentDate: parsedDate,
      description,
      checkNumber,
      checkDate,
      bankName,
      bankBranch,
      checkOwner,
      sayadiNumber,
    })
    return Response.json({ ok: true, payment }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در ثبت پرداخت')
  }
}
