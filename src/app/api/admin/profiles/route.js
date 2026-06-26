import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { getGradeRangesForYear } from '@/lib/services/gradeRangeService'
import { resolveGradeLabel } from '@/lib/gradeLevel'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    const [profiles, ranges] = await Promise.all([
      prisma.studentProfile.findMany({
        where: {
          profileCompleted: true,
          student: { academicYear },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationalId: true,
              studentCode: true,
              registrationStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      getGradeRangesForYear(academicYear),
    ])

    const enriched = profiles.map((profile) => ({
      ...profile,
      gradeLevel: resolveGradeLabel(profile.birthDate, ranges),
    }))

    return Response.json({ profiles: enriched })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت پروفایل‌ها')
  }
}
