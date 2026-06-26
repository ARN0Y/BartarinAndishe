import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { listAlbums, createAlbum } from '@/lib/services/memoryAlbumService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json({ albums: await listAlbums() })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت آلبوم‌ها')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const album = await createAlbum(await request.json())
    return Response.json({ ok: true, album })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد آلبوم')
  }
}
