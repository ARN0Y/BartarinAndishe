import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getStudentInvoice } from '@/lib/services/manualPaymentService'
import { listWorksheets } from '@/lib/services/worksheetService'
import { listSpotDifferenceGames } from '@/lib/services/spotDifferenceService'
import { listMatchingGames } from '@/lib/services/matchingGameService'
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

    const [invoice, worksheets, interactiveCodes, spotDifferenceGames, matchingGames] = await Promise.all([
      getStudentInvoice(studentId),
      listWorksheets({ visibleOnly: true }),
      prisma.interactiveCode.findMany({
        where: { isVisible: true },
        select: { slug: true },
        orderBy: { slug: 'asc' },
      }),
      listSpotDifferenceGames({ visibleOnly: true }),
      listMatchingGames({ visibleOnly: true }),
    ])
    return Response.json({
      invoice,
      worksheets,
      visibleInteractiveSlugs: interactiveCodes.map((c) => c.slug),
      spotDifferenceGames,
      matchingGames,
      schedules: invoice.schedules,
    })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اطلاعات')
  }
}
