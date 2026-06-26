import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  createSpotDifferenceStage,
  getSpotDifferenceGameById,
} from '@/lib/services/spotDifferenceService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const game = await getSpotDifferenceGameById(id)
    return Response.json({ stages: game.stages })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت مراحل')
  }
}

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const formData = await request.formData()
    const stage = await createSpotDifferenceStage(id, {
      title: formData.get('title'),
      imageLeft: formData.get('imageLeft'),
      imageRight: formData.get('imageRight'),
    })
    return Response.json({ stage }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در افزودن مرحله')
  }
}
