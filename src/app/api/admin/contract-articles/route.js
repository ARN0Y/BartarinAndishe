import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getContractArticles, saveContractArticles } from '@/lib/services/contractArticlesService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json({ articles: await getContractArticles() })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت مواد قرارداد')
  }
}

export async function PUT(request) {
  try {
    await requireAdmin()
    const { articles } = await request.json()
    const saved = await saveContractArticles(articles)
    return Response.json({ ok: true, articles: saved })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره مواد قرارداد')
  }
}
