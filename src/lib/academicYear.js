import { config } from '@/lib/config'
import { toEnglishDigits } from '@/lib/digits'
import { AppError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

export const ACTIVE_ACADEMIC_YEAR_KEY = 'activeAcademicYear'

/** سال تحصیلی از .env — فقط به‌عنوان پیش‌فرض اولیه */
export function getEnvAcademicYear() {
  return config.academicYear || '1405-1406'
}

/** @deprecated ترجیحاً از getActiveAcademicYear استفاده کنید */
export function getDefaultAcademicYear() {
  return getEnvAcademicYear()
}

/** نرمال‌سازی برچسب سال تحصیلی — مثلاً 1405-1406 */
export function normalizeAcademicYear(input) {
  const raw = toEnglishDigits(input || '').trim()
  if (!raw) return getEnvAcademicYear()
  if (!/^\d{4}-\d{4}$/.test(raw)) {
    throw new AppError(422, 'سال تحصیلی باید با قالب 1405-1406 وارد شود.')
  }

  const [start, end] = raw.split('-').map(Number)
  if (end !== start + 1) {
    throw new AppError(422, 'بازه سال تحصیلی باید پیوسته باشد؛ مثل 1405-1406.')
  }

  return raw
}

/** نمایش سال تحصیلی برای والدین و فاکتور — 1405-1406 → 1406-1405 */
export function formatAcademicYearDisplay(academicYear) {
  const raw = normalizeAcademicYear(academicYear)
  const parts = raw.split('-')
  if (parts.length === 2) return `${parts[1]}-${parts[0]}`
  return raw
}

/** سال تحصیلی فعال (پیش‌ثبت‌نام، ورود اولیا) — از دیتابیس، در غیر این صورت .env */
export async function getActiveAcademicYear() {
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: ACTIVE_ACADEMIC_YEAR_KEY },
    })
    if (row?.value) return row.value
  } catch {
    /* جدول هنوز migrate نشده */
  }
  return getEnvAcademicYear()
}

export async function setActiveAcademicYear(input) {
  const year = normalizeAcademicYear(input)
  await prisma.appSetting.upsert({
    where: { key: ACTIVE_ACADEMIC_YEAR_KEY },
    create: { key: ACTIVE_ACADEMIC_YEAR_KEY, value: year },
    update: { value: year },
  })
  return year
}

export async function listAcademicYears() {
  const activeYear = await getActiveAcademicYear()
  const [fromPreReg, fromStudents, fromManual, fromSched, fromGrades] = await Promise.all([
    prisma.preRegistration.findMany({ select: { academicYear: true }, distinct: ['academicYear'] }),
    prisma.student.findMany({ select: { academicYear: true }, distinct: ['academicYear'] }),
    prisma.manualPayment.findMany({ select: { academicYear: true }, distinct: ['academicYear'] }),
    prisma.paymentSchedule.findMany({ select: { academicYear: true }, distinct: ['academicYear'] }),
    prisma.gradeBirthRange.findMany({ select: { academicYear: true }, distinct: ['academicYear'] }),
  ])

  const years = new Set([activeYear])
  for (const row of [...fromPreReg, ...fromStudents, ...fromManual, ...fromSched, ...fromGrades]) {
    if (row.academicYear) years.add(row.academicYear)
  }

  return [...years].sort((a, b) => b.localeCompare(a, 'fa'))
}

/** حذف کامل داده‌های یک سال تحصیلی */
export async function purgeAcademicYear(academicYear) {
  const year = normalizeAcademicYear(academicYear)
  const students = await prisma.student.findMany({
    where: { academicYear: year },
    select: { id: true },
  })
  const studentIds = students.map((s) => s.id)

  await prisma.$transaction(async (tx) => {
    if (studentIds.length) {
      await tx.manualPayment.deleteMany({ where: { studentId: { in: studentIds } } })
      await tx.paymentSchedule.deleteMany({ where: { studentId: { in: studentIds } } })
      await tx.message.deleteMany({ where: { toStudentId: { in: studentIds } } })
      await tx.payment.deleteMany({ where: { studentId: { in: studentIds } } })
      await tx.studentProfile.deleteMany({ where: { studentId: { in: studentIds } } })
      await tx.student.deleteMany({ where: { id: { in: studentIds } } })
    }
    await tx.manualPayment.deleteMany({ where: { academicYear: year } })
    await tx.paymentSchedule.deleteMany({ where: { academicYear: year } })
    await tx.preRegistration.deleteMany({ where: { academicYear: year } })
    await tx.gradeBirthRange.deleteMany({ where: { academicYear: year } })
  })

  return {
    year,
    deletedStudents: studentIds.length,
  }
}
