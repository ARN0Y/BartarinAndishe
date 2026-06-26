import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  getActiveAcademicYear,
  listAcademicYears,
  normalizeAcademicYear,
  setActiveAcademicYear,
} from '@/lib/academicYear'

export async function GET() {
  try {
    await requireAdmin()
    const [years, active] = await Promise.all([listAcademicYears(), getActiveAcademicYear()])
    return Response.json({ years, active, current: active })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت سال‌های تحصیلی')
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin()
    const { year } = await request.json()
    if (!year?.trim()) {
      return Response.json({ message: 'سال تحصیلی الزامی است.' }, { status: 422 })
    }
    const active = await setActiveAcademicYear(normalizeAcademicYear(year))
    const years = await listAcademicYears()
    return Response.json({ active, years, message: `سال ${active} برای پیش‌ثبت‌نام فعال شد.` })
  } catch (error) {
    return jsonError(error, 'خطا در فعال‌سازی سال تحصیلی')
  }
}
