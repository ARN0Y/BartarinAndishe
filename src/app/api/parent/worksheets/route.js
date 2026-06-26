import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { listWorksheets } from '@/lib/services/worksheetService'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireParent()
    const [worksheets, interactiveCodes] = await Promise.all([
      listWorksheets({ visibleOnly: true }),
      prisma.interactiveCode.findMany({
        where: { isVisible: true },
        select: { slug: true },
        orderBy: { slug: 'asc' },
      }),
    ])
    return Response.json({
      worksheets,
      visibleInteractiveSlugs: interactiveCodes.map((c) => c.slug),
    })
  } catch (error) {
    return jsonError(error, 'خطا')
  }
}
