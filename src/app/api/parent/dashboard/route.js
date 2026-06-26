import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getParentFinancialDashboard } from '@/lib/services/paymentService'
import { listWorksheets } from '@/lib/services/worksheetService'

export async function GET() {
  try {
    const session = await requireParent()
    const [financial, worksheets] = await Promise.all([
      getParentFinancialDashboard(Number(session.studentId)),
      listWorksheets({ visibleOnly: true }),
    ])
    return Response.json({ financial, worksheets })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت پنل والدین')
  }
}
