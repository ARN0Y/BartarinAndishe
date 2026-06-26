import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireParent()
    const codes = await prisma.interactiveCode.findMany({
      where: { isVisible: true },
      orderBy: { slug: 'asc' },
      select: { slug: true },
    })
    return Response.json({
      visibleInteractiveSlugs: codes.map((c) => c.slug),
    })
  } catch (error) {
    return jsonError(error, 'خطا')
  }
}
