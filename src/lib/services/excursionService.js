import path from 'path'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { formatCurrency } from '@/lib/formatters'
import { onlyEnglishDigits } from '@/lib/digits'

export function formatExcursion(e) {
  return {
    id: e.id,
    academicYear: e.academicYear,
    title: e.title,
    description: e.description || '',
    costRial: e.costRial,
    costFormatted: formatCurrency(e.costRial),
    isActive: e.isActive,
    createdAt: e.createdAt,
    consentCount: e._count?.consents ?? undefined,
  }
}

export async function listExcursions(academicYear, { activeOnly = false } = {}) {
  const year = normalizeAcademicYear(academicYear)
  const rows = await prisma.excursion.findMany({
    where: { academicYear: year, ...(activeOnly ? { isActive: true } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { consents: true } } },
  })
  return rows.map(formatExcursion)
}

export async function getExcursion(id) {
  const e = await prisma.excursion.findUnique({ where: { id: Number(id) } })
  if (!e) throw new AppError(404, 'اردو یافت نشد.')
  return e
}

export async function createExcursion(academicYear, { title, description, costRial }) {
  const year = normalizeAcademicYear(academicYear)
  const t = String(title || '').trim()
  if (!t) throw new AppError(422, 'عنوان اردو الزامی است.')
  const cost = Math.max(0, Number(onlyEnglishDigits(costRial)) || 0)
  const created = await prisma.excursion.create({
    data: { academicYear: year, title: t, description: String(description || '').trim(), costRial: cost },
  })
  return formatExcursion(created)
}

export async function updateExcursion(id, data) {
  const patch = {}
  if (data.title !== undefined) {
    const t = String(data.title || '').trim()
    if (!t) throw new AppError(422, 'عنوان اردو الزامی است.')
    patch.title = t
  }
  if (data.description !== undefined) patch.description = String(data.description || '').trim()
  if (data.costRial !== undefined) patch.costRial = Math.max(0, Number(onlyEnglishDigits(data.costRial)) || 0)
  if (data.isActive !== undefined) patch.isActive = Boolean(data.isActive)
  if (!Object.keys(patch).length) throw new AppError(422, 'فیلدی برای ویرایش ارسال نشده.')
  return formatExcursion(await prisma.excursion.update({ where: { id: Number(id) }, data: patch }))
}

/** حذف اردو — رضایت‌نامه‌های آن (اسامی و اطلاعات) با Cascade حذف می‌شوند */
export async function deleteExcursion(id) {
  const e = await prisma.excursion.findUnique({ where: { id: Number(id) } })
  if (!e) throw new AppError(404, 'اردو یافت نشد.')
  await prisma.excursion.delete({ where: { id: e.id } })
  try {
    const { rm } = await import('fs/promises')
    await rm(path.join(process.cwd(), 'public', 'uploads', 'excursions', String(e.id)), { recursive: true, force: true })
  } catch { /* ignore */ }
  return { ok: true }
}

function participantStatus(c) {
  return {
    studentId: c.studentId,
    fullName: `${c.student.firstName} ${c.student.lastName}`.trim(),
    studentCode: c.student.studentCode || '',
    nationalId: c.student.nationalId,
    signed: Boolean(c.consentAccepted && c.parentSignatureUrl),
    verified: Boolean(c.phoneVerifiedAt),
    paid: c.paymentStatus === 'Success',
    completed: Boolean(c.phoneVerifiedAt && c.paymentStatus === 'Success'),
  }
}

/** خلاصهٔ کلاسی یک اردو — تعداد و اسامی نوآموزانی که رضایت‌نامه را تکمیل و پرداخت کرده‌اند */
export async function getExcursionClassSummary(id) {
  const excursion = await getExcursion(id)
  const [consents, classes] = await Promise.all([
    prisma.excursionConsent.findMany({
      where: { excursionId: excursion.id },
      include: { student: { select: { id: true, firstName: true, lastName: true, classId: true, studentCode: true, nationalId: true } } },
    }),
    prisma.schoolClass.findMany({ where: { academicYear: excursion.academicYear }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
  ])

  const byClass = new Map()
  const unassigned = []
  for (const c of consents) {
    const s = participantStatus(c)
    const cid = c.student.classId
    if (cid == null) unassigned.push(s)
    else {
      if (!byClass.has(cid)) byClass.set(cid, [])
      byClass.get(cid).push(s)
    }
  }

  const classSummary = classes.map((cls) => {
    const parts = byClass.get(cls.id) || []
    return {
      id: cls.id,
      name: cls.name,
      teacherName: cls.teacherName || '',
      participants: parts,
      completedCount: parts.filter((p) => p.completed).length,
      total: parts.length,
    }
  })

  return {
    excursion: formatExcursion(excursion),
    classes: classSummary,
    unassigned: {
      participants: unassigned,
      completedCount: unassigned.filter((p) => p.completed).length,
      total: unassigned.length,
    },
    totals: {
      completed: consents.filter((c) => c.phoneVerifiedAt && c.paymentStatus === 'Success').length,
      signed: consents.filter((c) => c.consentAccepted && c.parentSignatureUrl).length,
      paid: consents.filter((c) => c.paymentStatus === 'Success').length,
    },
  }
}
