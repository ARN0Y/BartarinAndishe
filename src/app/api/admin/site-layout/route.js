import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getSiteLayoutForAdmin, saveSiteLayout } from '@/lib/services/siteLayoutService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json(await getSiteLayoutForAdmin())
  } catch (error) {
    return jsonError(error, 'خطا در دریافت چیدمان سایت')
  }
}

export async function PUT(request) {
  try {
    await requireAdmin()
    const layout = await saveSiteLayout(await request.json())
    return Response.json({ ok: true, layout })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره چیدمان سایت')
  }
}
