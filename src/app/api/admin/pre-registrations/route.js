import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    const list = await prisma.preRegistration.findMany({
      where: { academicYear },
      orderBy: { createdAt: 'desc' },
    })
    const studentIds = list.map((r) => r.studentId).filter(Boolean)
    const students = studentIds.length
      ? await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, studentCode: true },
        })
      : []
    const codeByStudentId = Object.fromEntries(students.map((s) => [s.id, s.studentCode]))
    const registrations = list.map((r) => ({
      ...r,
      student: r.studentId
        ? { id: r.studentId, studentCode: codeByStudentId[r.studentId] || null }
        : null,
    }))
    return Response.json({ registrations })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت پیش ثبت‌نام‌ها')
  }
}
