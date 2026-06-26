import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import {
  getAdminNavBadges,
  markConfirmedProfilesSeen,
} from '@/lib/services/adminNavBadgeService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(
      searchParams.get('academicYear') || searchParams.get('year'),
    )
    return Response.json(await getAdminNavBadges(academicYear))
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اعلان‌های منو')
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const academicYear = normalizeAcademicYear(body.academicYear || body.year)

    if (body.tab === 'confirmed') {
      const badges = await markConfirmedProfilesSeen(academicYear)
      return Response.json({ ok: true, ...badges })
    }

    return Response.json({ message: 'عملیات نامعتبر.' }, { status: 400 })
  } catch (error) {
    return jsonError(error, 'خطا در به‌روزرسانی اعلان‌های منو')
  }
}
