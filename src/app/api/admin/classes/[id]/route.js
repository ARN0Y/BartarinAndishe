import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { updateClass, deleteClass } from '@/lib/services/classService'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const cls = await updateClass(Number(id), body)
    return Response.json({ ok: true, class: cls })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش کلاس')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteClass(Number(id))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف کلاس')
  }
}
