import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { createSpotDifferenceGame, listSpotDifferenceGames } from '@/lib/services/spotDifferenceService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json({ games: await listSpotDifferenceGames() })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازی‌ها')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const game = await createSpotDifferenceGame({
        title: formData.get('title'),
        description: formData.get('description'),
        slug: formData.get('slug'),
      })
      return Response.json({ game }, { status: 201 })
    }

    const body = await request.json()
    const game = await createSpotDifferenceGame(body)
    return Response.json({ game }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد بازی')
  }
}
