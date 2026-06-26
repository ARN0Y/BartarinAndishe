import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deleteMessage } from '@/lib/services/messageService'

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    return Response.json(await deleteMessage(id))
  } catch (e) {
    return jsonError(e, 'خطا')
  }
}
