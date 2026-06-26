import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  deleteMatchingGame,
  getMatchingGameById,
  updateMatchingGame,
} from '@/lib/services/matchingGameService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const game = await getMatchingGameById(id)
    return Response.json({ game })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازی')
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const game = await updateMatchingGame(id, body)
    return Response.json({ game })
  } catch (error) {
    return jsonError(error, 'خطا در به‌روزرسانی بازی')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteMatchingGame(id)
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف بازی')
  }
}
