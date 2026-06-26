import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear, purgeAcademicYear } from '@/lib/academicYear'

export async function DELETE(request, { params }) {
  try {
    await requireAdmin()
    const { year: rawYear } = await params
    const year = normalizeAcademicYear(decodeURIComponent(rawYear))
    const body = await request.json().catch(() => ({}))
    if (body.confirm !== year) {
      return Response.json({
        message: `برای تأیید حذف، عبارت «${year}» را در فیلد confirm ارسال کنید.`,
      }, { status: 422 })
    }
    const result = await purgeAcademicYear(year)
    return Response.json({ ok: true, ...result })
  } catch (error) {
    return jsonError(error, 'خطا در حذف داده‌های سال تحصیلی')
  }
}
