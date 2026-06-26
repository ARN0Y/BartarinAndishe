import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { updateAlbum, deleteAlbum, addPhoto } from '@/lib/services/memoryAlbumService'

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const album = await updateAlbum(Number(id), await request.json())
    return Response.json({ ok: true, album })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش آلبوم')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteAlbum(Number(id))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف آلبوم')
  }
}

/** افزودن عکس به آلبوم */
export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const photo = await addPhoto(Number(id), await request.json())
    return Response.json({ ok: true, photo })
  } catch (error) {
    return jsonError(error, 'خطا در افزودن عکس')
  }
}
