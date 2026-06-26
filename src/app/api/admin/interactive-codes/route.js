import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const codes = await prisma.interactiveCode.findMany({ orderBy: { slug: 'asc' } })
    return Response.json({ codes })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت تنظیمات کاربرگ‌ها')
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin()
    const { slug, title, isVisible } = await request.json()
    if (!slug || !title) {
      return Response.json({ message: 'اطلاعات ناقص است.' }, { status: 422 })
    }
    const record = await prisma.interactiveCode.upsert({
      where: { slug },
      update: { isVisible: Boolean(isVisible), title },
      create: { slug, title, isVisible: Boolean(isVisible) },
    })
    return Response.json({ ok: true, record })
  } catch (error) {
    return jsonError(error, 'خطا در تغییر وضعیت نمایش')
  }
}
