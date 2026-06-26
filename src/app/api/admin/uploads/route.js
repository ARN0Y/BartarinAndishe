import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { saveUploadedImage } from '@/lib/uploadImage'

const ALLOWED_FOLDERS = new Set(['cms', 'memories', 'home'])

export async function POST(request) {
  try {
    await requireAdmin()
    const form = await request.formData()
    const file = form.get('file') || form.get('photo') || form.get('image')
    const folderRaw = String(form.get('folder') || 'cms')
    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : 'cms'

    if (!file || typeof file === 'string') {
      return Response.json({ message: 'فایل تصویر ارسال نشده.' }, { status: 422 })
    }

    const filename = `${folder}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
    const url = await saveUploadedImage(file, { uploadDir: `uploads/${folder}`, filename })
    return Response.json({ ok: true, url })
  } catch (error) {
    return jsonError(error, 'خطا در آپلود تصویر')
  }
}
