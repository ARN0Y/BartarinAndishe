import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deleteMatchingStage } from '@/lib/services/matchingGameService'

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { stageId } = await params
    await deleteMatchingStage(stageId)
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف مرحله')
  }
}
