import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { updateExcursion, deleteExcursion } from '@/lib/services/excursionService'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const excursion = await updateExcursion(Number(id), await request.json())
    return Response.json({ ok: true, excursion })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش اردو')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteExcursion(Number(id))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف اردو')
  }
}
