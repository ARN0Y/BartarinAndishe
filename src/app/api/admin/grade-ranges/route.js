import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import {
  getGradeRangesForYear,
  saveGradeRangesForYear,
  gradeRangesConfiguredForYear,
} from '@/lib/services/gradeRangeService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const year = normalizeAcademicYear(searchParams.get('year') || searchParams.get('academicYear'))
    const [ranges, configured] = await Promise.all([
      getGradeRangesForYear(year),
      gradeRangesConfiguredForYear(year),
    ])
    return Response.json({ year, ranges, configured })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازه‌های پایه تحصیلی')
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const year = normalizeAcademicYear(body.year || body.academicYear)
    const ranges = await saveGradeRangesForYear(year, body.ranges || [])
    return Response.json({ ok: true, year, ranges, configured: true })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره بازه‌های پایه تحصیلی')
  }
}
