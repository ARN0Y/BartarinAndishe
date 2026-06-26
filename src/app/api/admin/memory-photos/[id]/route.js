import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deletePhoto } from '@/lib/services/memoryAlbumService'

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
