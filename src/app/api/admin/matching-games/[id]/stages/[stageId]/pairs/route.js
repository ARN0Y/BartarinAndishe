import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { createMatchingPair } from '@/lib/services/matchingGameService'

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { stageId } = await params
    const formData = await request.formData()
    const pair = await createMatchingPair(stageId, {
      imageA: formData.get('imageA'),
      imageB: formData.get('imageB'),
    })
    return Response.json({ pair }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در افزودن جفت تصویر')
  }
}
