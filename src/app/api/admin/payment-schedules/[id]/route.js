import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { jalaliToDate } from '@/lib/jalali'
import { findDuplicateScheduleInDb, normalizeJalaliDate } from '@/lib/financeDuplicates'
import { validateSayadiNumber, normalizeSayadiNumber } from '@/lib/sayadiNumber'
import { onlyEnglishDigits, toEnglishDigits } from '@/lib/digits'

function parseJalaliParts(date) {
  const normalized = normalizeJalaliDate(toEnglishDigits(date))
  const parts = normalized.split('/')
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return null
  }

  const dueYear = Number(parts[0])
  const dueMonth = Number(parts[1])
  if (!Number.isInteger(dueYear) || !Number.isInteger(dueMonth) || dueMonth < 1 || dueMonth > 12) {
    return null
  }

  return { normalized, dueYear, dueMonth }
}

// PATCH — ویرایش فیلدها یا تأیید پرداخت
export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id: rawId } = await params
    const body = await request.json()
    const { isPaid, amountDue, dueDate, description, checkNumber, checkDate, bankName, bankBranch, checkOwner, sayadiNumber, forceDuplicate } = body
    const id = Number(rawId)

    const existing = await prisma.paymentSchedule.findUnique({ where: { id } })
    if (!existing) return Response.json({ message: 'قسط یافت نشد.' }, { status: 404 })

    // ویرایش فیلدهای قسط (بدون تغییر isPaid)
    if (amountDue !== undefined || dueDate !== undefined || description !== undefined ||
        checkNumber !== undefined || checkDate !== undefined || bankName !== undefined ||
        bankBranch !== undefined || checkOwner !== undefined || sayadiNumber !== undefined) {
      const normalizedAmount = amountDue !== undefined ? onlyEnglishDigits(amountDue) : null
      const finalAmount = amountDue !== undefined ? Number(normalizedAmount) : existing.amountDue
      const finalDate = checkDate !== undefined
        ? checkDate
        : (dueDate !== undefined ? dueDate : (existing.checkDate || existing.dueDate))

      if ((amountDue !== undefined || dueDate !== undefined || checkDate !== undefined) && !forceDuplicate) {
        const dup = await findDuplicateScheduleInDb(prisma, existing.studentId, finalDate, finalAmount, id)
        if (dup) {
          return Response.json({
            message: `قسط با تاریخ «${normalizeJalaliDate(finalDate)}» و مبلغ «${finalAmount.toLocaleString('en-US')} ریال» قبلاً ثبت شده است.`,
            duplicate: true,
          }, { status: 409 })
        }
      }

      const data = {}
      if (amountDue !== undefined) data.amountDue = Number(normalizedAmount)
      if (amountDue !== undefined && (!Number.isFinite(data.amountDue) || data.amountDue < 1 || data.amountDue > 999_999_999_999)) {
        return Response.json({ message: 'مبلغ نامعتبر است.' }, { status: 422 })
      }
      if (checkDate !== undefined) {
        const parsedCheckDate = checkDate?.trim() ? parseJalaliParts(checkDate) : null
        if (checkDate?.trim() && !parsedCheckDate) {
          return Response.json({ message: 'فرمت تاریخ چک نادرست است.' }, { status: 422 })
        }
        data.checkDate = parsedCheckDate?.normalized || null
        if (parsedCheckDate) {
          data.dueDate = parsedCheckDate.normalized
          data.dueMonth = parsedCheckDate.dueMonth
          data.dueYear = parsedCheckDate.dueYear
        }
      }
      if (dueDate !== undefined && checkDate === undefined) {
        const parsedDueDate = parseJalaliParts(dueDate)
        if (!parsedDueDate) {
          return Response.json({ message: 'فرمت تاریخ نادرست است.' }, { status: 422 })
        }
        data.dueDate = parsedDueDate.normalized
        data.dueMonth = parsedDueDate.dueMonth
        data.dueYear = parsedDueDate.dueYear
      }
      if (description !== undefined) data.description = description || null
      if (checkNumber !== undefined) data.checkNumber = checkNumber?.trim() || null
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
      await prisma.paymentSchedule.update({ where: { id }, data })
      return Response.json({ ok: true })
    }

    // تبدیل به تاریخ میلادی برای ذخیره در ManualPayment
    let paymentDate
    try {
      paymentDate = jalaliToDate(existing.dueDate)
    } catch {
      paymentDate = new Date()
    }

    // اگر تأیید پرداخت می‌شود، یک ManualPayment هم ثبت شود
    if (isPaid && !existing.isPaid) {
      await prisma.$transaction([
        prisma.paymentSchedule.update({
          where: { id },
          data: { isPaid: true, updatedAt: new Date() },
        }),
        prisma.manualPayment.create({
          data: {
            studentId: existing.studentId,
            academicYear: existing.academicYear,
            amountPaid: existing.amountDue,
            paymentDate,
            description: existing.description
              ? `${existing.description} — قسط ${existing.dueDate}`
              : `قسط ${existing.dueDate}`,
            checkNumber: existing.checkNumber,
            checkDate: existing.checkDate,
            bankName: existing.bankName,
            bankBranch: existing.bankBranch,
            checkOwner: existing.checkOwner,
            sayadiNumber: existing.sayadiNumber,
          },
        }),
      ])
    } else {
      // فقط وضعیت را برگشت بزن (بدون حذف ManualPayment)
      await prisma.paymentSchedule.update({
        where: { id },
        data: { isPaid: Boolean(isPaid), updatedAt: new Date() },
      })
    }

    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در بروزرسانی قسط')
  }
}

// DELETE
export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await prisma.paymentSchedule.delete({ where: { id: Number(id) } })
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف قسط')
  }
}
