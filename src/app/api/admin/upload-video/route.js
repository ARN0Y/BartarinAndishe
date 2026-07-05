import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { saveOptimizedVideo } from '@/lib/uploadVideo'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request) {
  try {
    await requireAdmin()
    const form = await request.formData()
    const file = form.get('file') || form.get('video')
    const url = await saveOptimizedVideo(file, { filename: 'clip' })
    return Response.json({ ok: true, url })
  } catch (error) {
    return jsonError(error, 'خطا در آپلود ویدیو')
  }
}
