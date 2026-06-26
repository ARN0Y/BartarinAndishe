import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const data = {}
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive
    if (body.text?.trim()) data.text = body.text.trim()
    const ann = await prisma.announcement.update({
      where: { id: Number(id) },
      data,
      include: {
        recipients: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, nationalId: true, academicYear: true } },
          },
        },
      },
    })
    return Response.json({ announcement: ann })
  } catch (e) {
    return jsonError(e, 'خطا')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await prisma.announcement.delete({ where: { id: Number(id) } })
    return Response.json({ ok: true })
  } catch (e) {
    return jsonError(e, 'خطا')
  }
}
