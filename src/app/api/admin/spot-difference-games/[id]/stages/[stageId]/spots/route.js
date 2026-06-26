import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { replaceSpotDifferenceSpots } from '@/lib/services/spotDifferenceService'

export async function PUT(request, { params }) {
  try {
    await requireAdmin()
    const { stageId } = await params
    const { spots } = await request.json()
    const stage = await replaceSpotDifferenceSpots(stageId, spots || [])
    return Response.json({ stage })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره تفاوت‌ها')
  }
}
