import { jsonError } from '@/lib/errors'
import { getActiveAcademicYear } from '@/lib/academicYear'

export async function GET() {
  try {
    const active = await getActiveAcademicYear()
    return Response.json({ active })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت سال تحصیلی')
  }
}
