import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { createMatchingGame, listMatchingGames } from '@/lib/services/matchingGameService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json({ games: await listMatchingGames() })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت بازی‌ها')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const game = await createMatchingGame(body)
    return Response.json({ game }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد بازی')
  }
}
