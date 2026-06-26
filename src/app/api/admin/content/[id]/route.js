import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { updateContentBlock, deleteContentBlock } from '@/lib/services/contentService'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const item = await updateContentBlock(Number(id), await request.json())
    return Response.json({ ok: true, item })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش محتوا')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteContentBlock(Number(id))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف محتوا')
  }
}
