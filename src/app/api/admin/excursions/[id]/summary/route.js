import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getExcursionClassSummary } from '@/lib/services/excursionService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    return Response.json(await getExcursionClassSummary(Number(id)))
  } catch (error) {
    return jsonError(error, 'خطا در دریافت گزارش کلاسی اردو')
  }
}
