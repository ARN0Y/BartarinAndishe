import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { buildAcademicYearsExcelBuffer } from '@/lib/services/excelService'

export async function GET() {
  try {
    await requireAdmin()
    const { buffer, filename } = await buildAcademicYearsExcelBuffer()
    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return jsonError(error, 'خطا در خروجی اکسل سال‌های تحصیلی')
  }
}
