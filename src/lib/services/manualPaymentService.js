import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, fullName } from '@/lib/formatters'
import { AppError } from '@/lib/errors'
import { getActiveAcademicYear } from '@/lib/academicYear'
import { getGradeRangesForYear } from '@/lib/services/gradeRangeService'
import { getContractSettings } from '@/lib/services/contractSettingsService'
import { resolveGradeLabel } from '@/lib/gradeLevel'
import { splitInvoiceSchedules, buildAmanatCollateralNotes } from '@/lib/invoiceSchedules'
import jalaali from 'jalaali-js'

function toJalaliMonthYear(date) {
  const d = new Date(date)
  const { jy, jm } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return { jy, jm }
}

async function resolveYearTuitionRial(academicYear) {
  const settings = await getContractSettings(academicYear)
  const rial = Number(settings?.tuitionRial) || 0
  return rial > 0 ? rial : null
}

export async function getAllStudentsWithPayments(academicYear) {
  const year = academicYear || await getActiveAcademicYear()
  const [students, ranges, preRegs, yearTuition] = await Promise.all([
    prisma.student.findMany({
      where: { academicYear: year },
      include: {
        manualPayments: { orderBy: { paymentDate: 'asc' } },
        paymentSchedules: { orderBy: [{ dueYear: 'asc' }, { dueMonth: 'asc' }] },
        profile: { select: { gender: true, birthDate: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    }),
    getGradeRangesForYear(year),
    prisma.preRegistration.findMany({
      where: { academicYear: year },
      select: { studentId: true, gradeLevel: true, birthDate: true, updatedAt: true, status: true },
    }),
    resolveYearTuitionRial(year),
  ])
  const preRegByStudent = new Map(preRegs.map((p) => [p.studentId, p]))

  return students.map((s) => {
    const preReg = preRegByStudent.get(s.id)
    const gradeLevel = resolveGradeLabel(
      s.profile?.birthDate || preReg?.birthDate,
      ranges,
      preReg?.gradeLevel,
    )
    const confirmedAt = preReg?.status === 'Confirmed'
      ? preReg.updatedAt
      : (s.registrationStatus === 'Confirmed' ? (s.updatedAt || s.createdAt) : s.createdAt)
    return formatStudentInvoice(s, gradeLevel, yearTuition, [], confirmedAt)
  })
}

export async function getStudentInvoice(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      manualPayments: { orderBy: { paymentDate: 'asc' } },
      paymentSchedules: { orderBy: [{ dueYear: 'asc' }, { dueMonth: 'asc' }] },
      profile: { select: { gender: true, birthDate: true } },
    },
  })
  if (!student) throw new AppError(404, 'نوآموز یافت نشد.')

  const [ranges, preReg, yearTuition, financialPlan] = await Promise.all([
    getGradeRangesForYear(student.academicYear),
    prisma.preRegistration.findFirst({
      where: { studentId: student.id },
      select: { gradeLevel: true, birthDate: true },
    }),
    resolveYearTuitionRial(student.academicYear),
    prisma.studentFinancialPlan.findUnique({
      where: { studentId: student.id },
      include: { lines: { orderBy: { sortOrder: 'asc' } } },
    }),
  ])
  const gradeLevel = resolveGradeLabel(
    student.profile?.birthDate || preReg?.birthDate,
    ranges,
    preReg?.gradeLevel,
  )

  return formatStudentInvoice(student, gradeLevel, yearTuition, financialPlan?.lines || [])
}

function formatStudentInvoice(student, gradeLevel = null, yearTuition = null, planLines = [], confirmedAt = null) {
  const payments = student.manualPayments.map((p) => {
    const { jy, jm } = toJalaliMonthYear(p.paymentDate)
    return {
      id: p.id,
      amountPaid: p.amountPaid,
      amountFormatted: formatCurrency(p.amountPaid),
      paymentDate: p.paymentDate,
      dateFormatted: formatDate(p.paymentDate),
      payYear: jy,
      payMonth: jm,
      description: p.description || '',
      checkNumber: p.checkNumber || null,
      checkDate: p.checkDate || null,
      bankName: p.bankName || null,
      bankBranch: p.bankBranch || null,
      checkOwner: p.checkOwner || null,
      sayadiNumber: p.sayadiNumber || null,
    }
  })

  const total = payments.reduce((sum, p) => sum + p.amountPaid, 0)

  const allSchedules = (student.paymentSchedules || []).map((sc) => ({
    id: sc.id,
    dueDate: sc.dueDate,
    dueMonth: sc.dueMonth,
    dueYear: sc.dueYear,
    amountDue: sc.amountDue,
    amountFormatted: formatCurrency(sc.amountDue),
    description: sc.description || '',
    isPaid: sc.isPaid,
    checkNumber: sc.checkNumber || null,
    checkDate: sc.checkDate || sc.dueDate || null,
    bankName: sc.bankName || null,
    bankBranch: sc.bankBranch || null,
    checkOwner: sc.checkOwner || null,
    sayadiNumber: sc.sayadiNumber || null,
  }))

  const { installments: schedules } = splitInvoiceSchedules(allSchedules)
  const amanatCollateralNotes = buildAmanatCollateralNotes(allSchedules, planLines)

  const totalTuition = yearTuition
  const remaining = totalTuition !== null ? totalTuition - total : null

  return {
    studentId: student.id,
    studentCode: student.studentCode,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: fullName(student),
    nationalId: student.nationalId,
    academicYear: student.academicYear,
    gradeLevel,
    gender: student.profile?.gender ?? null,
    registrationStatus: student.registrationStatus,
    createdAt: student.createdAt,
    confirmedAt: confirmedAt || student.updatedAt || student.createdAt,
    totalTuition,
    totalTuitionFormatted: totalTuition !== null ? formatCurrency(totalTuition) : null,
    payments,
    total,
    totalFormatted: formatCurrency(total),
    remaining,
    remainingFormatted: remaining !== null ? formatCurrency(remaining) : null,
    schedules,
    amanatCollateralNotes,
  }
}

export async function addManualPayment({ studentId, amountPaid, paymentDate, description, checkNumber, checkDate, bankName, bankBranch, checkOwner, sayadiNumber }) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw new AppError(404, 'نوآموز یافت نشد.')
  if (!amountPaid || amountPaid < 1) throw new AppError(422, 'مبلغ نامعتبر است.')

  return prisma.manualPayment.create({
    data: {
      studentId,
      academicYear: student.academicYear,
      amountPaid: Number(amountPaid),
      paymentDate: new Date(paymentDate),
      description: description || null,
      checkNumber: checkNumber?.trim() || null,
      checkDate: checkDate?.trim() || null,
      bankName: bankName?.trim() || null,
      bankBranch: bankBranch?.trim() || null,
      checkOwner: checkOwner?.trim() || null,
      sayadiNumber: sayadiNumber?.trim() || null,
    },
  })
}

export async function deleteManualPayment(id) {
  const p = await prisma.manualPayment.findUnique({ where: { id } })
  if (!p) throw new AppError(404, 'پرداخت یافت نشد.')
  await prisma.manualPayment.delete({ where: { id } })
  return { ok: true }
}
