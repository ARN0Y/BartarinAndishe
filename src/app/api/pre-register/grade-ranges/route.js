import { jsonError } from '@/lib/errors'
import { getActiveAcademicYear } from '@/lib/academicYear'
import {
  getGradeRangesForYear,
  gradeRangesConfiguredForYear,
} from '@/lib/services/gradeRangeService'

export async function GET() {
  try {
    const year = await getActiveAcademicYear()
    const [ranges, configured] = await Promise.all([
      getGradeRangesForYear(year),
      gradeRangesConfiguredForYear(year),
    ])
    return Response.json({ year, ranges, configured })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازه‌های پایه تحصیلی')
  }
}
