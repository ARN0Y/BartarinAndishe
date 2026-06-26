import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api/guards'
import { jsonError, AppError } from '@/lib/errors'

/** PATCH /api/admin/comments/:id — تأیید نظر */
export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id: rawId } = await params
    const id = Number(rawId)
    const body = await request.json().catch(() => ({}))
    const approved = body.approved !== undefined ? Boolean(body.approved) : true

    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) throw new AppError(404, 'نظر یافت نشد')

    await prisma.comment.update({ where: { id }, data: { approved } })
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در به‌روزرسانی نظر')
  }
}

/** DELETE /api/admin/comments/:id — حذف نظر */
export async function DELETE(request, { params }) {
  try {
    await requireAdmin()
    const { id: rawId } = await params
    const id = Number(rawId)
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) throw new AppError(404, 'نظر یافت نشد')

    await prisma.comment.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف نظر')
  }
}
