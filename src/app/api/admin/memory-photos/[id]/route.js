import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deletePhoto, updatePhoto } from '@/lib/services/memoryAlbumService'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const photo = await updatePhoto(Number(id), await request.json())
    return Response.json({ ok: true, photo })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش عکس')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deletePhoto(Number(id))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف عکس')
  }
}
