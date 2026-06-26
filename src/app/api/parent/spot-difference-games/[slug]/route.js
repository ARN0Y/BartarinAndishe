import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getSpotDifferenceGameBySlug } from '@/lib/services/spotDifferenceService'

export async function GET(_, { params }) {
  try {
    await requireParent()
    const { slug } = await params
    const game = await getSpotDifferenceGameBySlug(slug, { visibleOnly: true })
    return Response.json({ game })
  } catch (error) {
    return jsonError(error, 'خطا در بارگذاری بازی')
  }
}
