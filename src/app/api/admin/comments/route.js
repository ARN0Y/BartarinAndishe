import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { formatDate } from '@/lib/formatters'

/** GET /api/admin/comments — لیست همه نظرات (تأییدشده و نشده) */
export async function GET() {
  try {
    await requireAdmin()
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json({
      comments: comments.map((c) => ({
        id: c.id,
        name: c.name,
        text: c.text,
        approved: c.approved,
        createdAtFormatted: formatDate(c.createdAt),
      })),
    })
  } catch (error) {
    return jsonError(error, 'خطا در بارگذاری نظرات')
  }
}
