import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { listExcursions, createExcursion } from '@/lib/services/excursionService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    return Response.json({ excursions: await listExcursions(academicYear) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اردوها')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    const excursion = await createExcursion(academicYear, await request.json())
    return Response.json({ ok: true, excursion })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد اردو')
  }
}
