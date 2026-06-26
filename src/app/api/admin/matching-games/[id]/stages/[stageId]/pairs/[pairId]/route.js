import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deleteMatchingPair } from '@/lib/services/matchingGameService'

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { pairId } = await params
    await deleteMatchingPair(pairId)
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف جفت تصویر')
  }
}
