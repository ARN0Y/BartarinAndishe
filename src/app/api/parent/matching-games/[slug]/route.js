import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getMatchingGameBySlug } from '@/lib/services/matchingGameService'

export async function GET(_, { params }) {
  try {
    await requireParent()
    const { slug } = await params
    const game = await getMatchingGameBySlug(slug, { visibleOnly: true })
    return Response.json({ game })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازی')
  }
}
