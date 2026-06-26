import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  deleteSpotDifferenceStage,
  getSpotDifferenceStageById,
  updateSpotDifferenceStage,
} from '@/lib/services/spotDifferenceService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { stageId } = await params
    return Response.json({ stage: await getSpotDifferenceStageById(stageId) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت مرحله')
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { stageId } = await params
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const stage = await updateSpotDifferenceStage(stageId, {
        title: formData.get('title') || undefined,
        imageLeft: formData.get('imageLeft') || undefined,
        imageRight: formData.get('imageRight') || undefined,
      })
      return Response.json({ stage })
    }

    const body = await request.json()
    const stage = await updateSpotDifferenceStage(stageId, body)
    return Response.json({ stage })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش مرحله')
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin()
    const { stageId } = await params
    return Response.json(await deleteSpotDifferenceStage(stageId))
  } catch (error) {
    return jsonError(error, 'خطا در حذف مرحله')
  }
}
