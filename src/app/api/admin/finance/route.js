import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { getAdminFinancialDashboard } from '@/lib/services/paymentService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = searchParams.get('academicYear') || searchParams.get('year')
    return Response.json(await getAdminFinancialDashboard(academicYear ? normalizeAcademicYear(academicYear) : undefined))
  } catch (error) {
    return jsonError(error, 'خطا در دریافت گزارش مالی')
  }
}
