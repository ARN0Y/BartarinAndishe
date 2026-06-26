import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getHomeContentOverrides, getEditableDefaults, saveHomeContent } from '@/lib/services/homeContentService'

export async function GET() {
  try {
    await requireAdmin()
    const [overrides, defaults] = [await getHomeContentOverrides(), getEditableDefaults()]
    return Response.json({ overrides, defaults })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت محتوای صفحه اصلی')
  }
}

export async function PUT(request) {
  try {
    await requireAdmin()
    const saved = await saveHomeContent(await request.json())
    return Response.json({ ok: true, overrides: saved })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره محتوای صفحه اصلی')
  }
}
