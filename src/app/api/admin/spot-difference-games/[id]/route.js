import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  deleteSpotDifferenceGame,
  getSpotDifferenceGameById,
  updateSpotDifferenceGame,
} from '@/lib/services/spotDifferenceService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    return Response.json({ game: await getSpotDifferenceGameById(id) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازی')
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const game = await updateSpotDifferenceGame(id, body)
    return Response.json({ game })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش بازی')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    return Response.json(await deleteSpotDifferenceGame(id))
  } catch (error) {
    return jsonError(error, 'خطا در حذف بازی')
  }
}
