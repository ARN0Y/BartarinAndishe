import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { findDuplicateScheduleInDb, normalizeJalaliDate } from '@/lib/financeDuplicates'
import { normalizeAcademicYear } from '@/lib/academicYear'
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

// GET /api/admin/payment-schedules?month=1&year=1404
// POST /api/admin/payment-schedules
export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const dueMonth = searchParams.get('dueMonth') || searchParams.get('month')
    const dueYear = searchParams.get('dueYear') || searchParams.get('year')
    const academicYear = searchParams.get('academicYear')

    const where = {}
    if (academicYear) where.academicYear = normalizeAcademicYear(academicYear)
    if (dueMonth) where.dueMonth = parseInt(dueMonth)
    if (dueYear && /^\d{4}$/.test(String(dueYear))) where.dueYear = parseInt(dueYear)

    const schedules = await prisma.paymentSchedule.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, nationalId: true } },
      },
      orderBy: [{ dueYear: 'asc' }, { dueMonth: 'asc' }, { dueDate: 'asc' }],
    })

    return Response.json({ schedules })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت برنامه اقساط')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const {
      studentId, amountDue, dueDate, description,
      checkNumber, checkDate, bankName, bankBranch, checkOwner, sayadiNumber,
      forceDuplicate,
    } = await request.json()
    const normalizedAmount = onlyEnglishDigits(amountDue)

    const effectiveDueDate = dueDate || checkDate

    if (!studentId || !normalizedAmount || !effectiveDueDate) {
      return Response.json({ message: 'دانش‌آموز، مبلغ و تاریخ چک الزامی است.' }, { status: 422 })
    }

    const numAmount = Number(normalizedAmount)
    if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 999_999_999_999) {
      return Response.json({ message: 'مبلغ نامعتبر است.' }, { status: 422 })
    }

    if (!forceDuplicate) {
      const dup = await findDuplicateScheduleInDb(prisma, studentId, effectiveDueDate, normalizedAmount)
      if (dup) {
        return Response.json({
          message: `قسط با تاریخ «${normalizeJalaliDate(effectiveDueDate)}» و مبلغ «${numAmount.toLocaleString('en-US')} ریال» قبلاً ثبت شده است.`,
          duplicate: true,
        }, { status: 409 })
      }
    }

    const parsedDueDate = parseJalaliParts(effectiveDueDate)
    if (!parsedDueDate) {
      return Response.json({ message: 'فرمت تاریخ نادرست است.' }, { status: 422 })
    }

    const parsedCheckDate = checkDate?.trim() ? parseJalaliParts(checkDate) : null
    if (checkDate?.trim() && !parsedCheckDate) {
      return Response.json({ message: 'فرمت تاریخ چک نادرست است.' }, { status: 422 })
    }

    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } })
    if (!student) return Response.json({ message: 'نوآموز یافت نشد.' }, { status: 404 })

    if (sayadiNumber) {
      const sayadiErr = validateSayadiNumber(sayadiNumber, { required: false })
      if (sayadiErr) return Response.json({ message: sayadiErr }, { status: 422 })
    }

    const schedule = await prisma.paymentSchedule.create({
      data: {
        studentId: Number(studentId),
        academicYear: student.academicYear,
        amountDue: numAmount,
        dueDate: parsedDueDate.normalized,
        dueYear: parsedDueDate.dueYear,
        dueMonth: parsedDueDate.dueMonth,
        description: description?.trim() || null,
        checkNumber: checkNumber?.trim() || null,
        checkDate: parsedCheckDate?.normalized || parsedDueDate.normalized,
        bankName: bankName?.trim() || null,
        bankBranch: bankBranch?.trim() || null,
        checkOwner: checkOwner?.trim() || null,
        sayadiNumber: sayadiNumber ? normalizeSayadiNumber(sayadiNumber) : null,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, nationalId: true } },
      },
    })

    return Response.json({ ok: true, schedule })
  } catch (error) {
    return jsonError(error, 'خطا در ثبت قسط')
  }
}
