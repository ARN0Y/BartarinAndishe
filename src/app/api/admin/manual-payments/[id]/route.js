import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deleteManualPayment } from '@/lib/services/manualPaymentService'
import { prisma } from '@/lib/prisma'
import { jalaliToDate } from '@/lib/jalali'
import { findDuplicateCashInDb, normalizeJalaliDate } from '@/lib/financeDuplicates'
import { validateSayadiNumber, normalizeSayadiNumber } from '@/lib/sayadiNumber'
import { onlyEnglishDigits, toEnglishDigits } from '@/lib/digits'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id: rawId } = await params
    const { amountPaid, paymentDate, description, checkNumber, checkDate, bankName, bankBranch, checkOwner, sayadiNumber, forceDuplicate } = await request.json()
    const id = Number(rawId)

    const existing = await prisma.manualPayment.findUnique({ where: { id } })
    if (!existing) return Response.json({ message: 'پرداخت یافت نشد.' }, { status: 404 })

    const normalizedAmount = amountPaid !== undefined ? onlyEnglishDigits(amountPaid) : null
    const normalizedPaymentDate = paymentDate ? toEnglishDigits(paymentDate) : ''
    const finalAmount = amountPaid !== undefined ? Number(normalizedAmount) : existing.amountPaid
    const finalDate = paymentDate ? jalaliToDate(normalizedPaymentDate) : existing.paymentDate

    if ((amountPaid !== undefined || paymentDate) && !forceDuplicate) {
      const dup = await findDuplicateCashInDb(prisma, existing.studentId, finalDate, finalAmount, id)
      if (dup) {
        const dateLabel = paymentDate ? normalizeJalaliDate(normalizedPaymentDate) : normalizeJalaliDate(finalDate)
        return Response.json({
          message: `پرداخت نقدی با تاریخ «${dateLabel}» و مبلغ «${finalAmount.toLocaleString('en-US')} ریال» قبلاً ثبت شده است.`,
          duplicate: true,
        }, { status: 409 })
      }
    }

    const data = {}
    if (amountPaid !== undefined) {
      const amt = Number(normalizedAmount)
      if (!Number.isFinite(amt) || amt < 1 || amt > 999_999_999_999) {
        return Response.json({ message: 'مبلغ نامعتبر است.' }, { status: 422 })
      }
      data.amountPaid = amt
    }
    if (paymentDate) data.paymentDate = jalaliToDate(normalizedPaymentDate)
    if (description !== undefined) data.description = description
    if (checkNumber !== undefined) data.checkNumber = checkNumber?.trim() || null
    if (checkDate !== undefined) data.checkDate = checkDate?.trim() || null
    if (bankName !== undefined) data.bankName = bankName?.trim() || null
    if (bankBranch !== undefined) data.bankBranch = bankBranch?.trim() || null
    if (checkOwner !== undefined) data.checkOwner = checkOwner?.trim() || null
    if (sayadiNumber !== undefined) {
      if (sayadiNumber) {
        const sayadiErr = validateSayadiNumber(sayadiNumber, { required: false })
        if (sayadiErr) return Response.json({ message: sayadiErr }, { status: 422 })
        data.sayadiNumber = normalizeSayadiNumber(sayadiNumber)
      } else {
        data.sayadiNumber = null
      }
    }
    await prisma.manualPayment.update({ where: { id }, data })
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش پرداخت')
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteManualPayment(Number(id))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف پرداخت')
  }
}
