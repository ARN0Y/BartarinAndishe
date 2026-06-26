import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { buildPaymentsExcelBuffer } from '@/lib/services/excelService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const allYears = searchParams.get('allYears') === '1' || searchParams.get('scope') === 'all'
    const academicYear = searchParams.get('academicYear') || searchParams.get('year')
    const { buffer, filename } = await buildPaymentsExcelBuffer({ academicYear, allYears })
    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return jsonError(error, 'خطا در خروجی اکسل')
  }
}
