import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getStudentInvoice } from '@/lib/services/manualPaymentService'
import { listWorksheets } from '@/lib/services/worksheetService'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)

    const contract = await prisma.tuitionContract.findUnique({ where: { studentId } })
    if (!contract) {
      return Response.json(
        { message: 'پس از امضای قرارداد شهریه، فاکتور مالی در دسترس خواهد بود.' },
        { status: 403 },
      )
    }

    const [invoice, worksheets] = await Promise.all([
      getStudentInvoice(studentId),
      listWorksheets({ visibleOnly: true }),
    ])
    return Response.json({
      invoice,
      worksheets,
      schedules: invoice.schedules,
    })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اطلاعات')
  }
}
