import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getWhyUsForAdmin, saveWhyUs } from '@/lib/services/whyUsService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json(await getWhyUsForAdmin())
  } catch (error) {
    return jsonError(error, 'خطا در دریافت محتوای چرا برترین اندیشه')
  }
}

export async function PUT(request) {
  try {
    await requireAdmin()
    const { topics } = await request.json()
    const saved = await saveWhyUs(topics)
    return Response.json({ ok: true, topics: saved })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره محتوای چرا برترین اندیشه')
  }
}
