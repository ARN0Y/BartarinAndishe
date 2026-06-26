import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { listContentBlocks, createContentBlock } from '@/lib/services/contentService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    return Response.json({ items: await listContentBlocks(section) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت محتوا')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const item = await createContentBlock(section, await request.json())
    return Response.json({ ok: true, item })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد محتوا')
  }
}
