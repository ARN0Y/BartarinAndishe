import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  createMatchingStage,
  getMatchingGameById,
} from '@/lib/services/matchingGameService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const game = await getMatchingGameById(id)
    return Response.json({ stages: game.stages })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت مراحل')
  }
}

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const stage = await createMatchingStage(id, { title: body.title })
    return Response.json({ stage }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در افزودن مرحله')
  }
}
