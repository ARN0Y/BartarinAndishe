import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { fullName } from '@/lib/formatters'
import { getGradeRangesForYear } from '@/lib/services/gradeRangeService'
import { resolveGradeLabel } from '@/lib/gradeLevel'

export async function listClasses(academicYear) {
  const year = normalizeAcademicYear(academicYear)
  const classes = await prisma.schoolClass.findMany({
    where: { academicYear: year },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { students: true } } },
  })
  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    teacherName: c.teacherName || '',
    capacity: c.capacity ?? null,
    sortOrder: c.sortOrder,
    studentCount: c._count.students,
  }))
}

export async function createClass(academicYear, { name, teacherName, capacity }) {
  const year = normalizeAcademicYear(academicYear)
  const cleanName = String(name || '').trim()
  if (!cleanName) throw new AppError(422, 'نام کلاس الزامی است.')
  const max = await prisma.schoolClass.aggregate({
    where: { academicYear: year },
    _max: { sortOrder: true },
  })
  return prisma.schoolClass.create({
    data: {
      academicYear: year,
      name: cleanName,
      teacherName: String(teacherName || '').trim() || null,
      capacity: capacity ? Number(capacity) : null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  })
}

export async function updateClass(id, { name, teacherName, capacity }) {
  const data = {}
  if (name !== undefined) {
    const cleanName = String(name || '').trim()
    if (!cleanName) throw new AppError(422, 'نام کلاس الزامی است.')
    data.name = cleanName
  }
  if (teacherName !== undefined) data.teacherName = String(teacherName || '').trim() || null
  if (capacity !== undefined) data.capacity = capacity ? Number(capacity) : null
  if (!Object.keys(data).length) throw new AppError(422, 'فیلدی برای ویرایش ارسال نشده.')
  return prisma.schoolClass.update({ where: { id }, data })
}

export async function deleteClass(id) {
  const cls = await prisma.schoolClass.findUnique({ where: { id } })
  if (!cls) throw new AppError(404, 'کلاس یافت نشد.')
  // با حذف کلاس، نوآموزان آن بدون کلاس می‌شوند (onDelete: SetNull)
  await prisma.schoolClass.delete({ where: { id } })
  return { ok: true }
}

/** نوآموزان ثبت‌نام قطعی برای کلاس‌بندی به‌همراه کلاس فعلی هرکدام */
export async function getStudentsForAssignment(academicYear) {
  const year = normalizeAcademicYear(academicYear)
  const [students, ranges, preRegs] = await Promise.all([
    prisma.student.findMany({
      where: { academicYear: year, registrationStatus: 'Confirmed' },
      select: {
        id: true, firstName: true, lastName: true, nationalId: true,
        studentCode: true, classId: true,
        profile: { select: { gender: true, birthDate: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
    getGradeRangesForYear(year),
    prisma.preRegistration.findMany({
      where: { academicYear: year },
      select: { studentId: true, gradeLevel: true, birthDate: true },
    }),
  ])
  const preRegByStudent = new Map(preRegs.map((p) => [p.studentId, p]))
  return students.map((s) => {
    const preReg = preRegByStudent.get(s.id)
    return {
      id: s.id,
      fullName: fullName(s),
      nationalId: s.nationalId,
      studentCode: s.studentCode || '',
      gender: s.profile?.gender || preReg?.gender || '',
      gradeLevel: resolveGradeLabel(s.profile?.birthDate || preReg?.birthDate, ranges, preReg?.gradeLevel),
      classId: s.classId ?? null,
    }
  })
}

/** انتساب نوآموز به کلاس (یا حذف از کلاس با classId=null) */
export async function assignStudentToClass(studentId, classId) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw new AppError(404, 'نوآموز یافت نشد.')

  if (classId != null) {
    const cls = await prisma.schoolClass.findUnique({ where: { id: classId } })
    if (!cls) throw new AppError(404, 'کلاس یافت نشد.')
    if (cls.academicYear !== student.academicYear) {
      throw new AppError(422, 'کلاس و نوآموز در یک سال تحصیلی نیستند.')
    }
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { classId: classId ?? null },
  })
  return { ok: true }
}
