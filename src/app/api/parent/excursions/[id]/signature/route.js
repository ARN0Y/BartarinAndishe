import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { saveUploadedImage } from '@/lib/uploadImage'

export async function POST(request, { params }) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('signature')
    const url = await saveUploadedImage(file, {
      uploadDir: `uploads/excursions/${Number(id)}`,
      filename: `consent_${studentId}`,
      maxWidth: 1200,
      maxHeight: 800,
      quality: 88,
    })
    return Response.json({ ok: true, parentSignatureUrl: url })
  } catch (error) {
    return jsonError(error, error.message || 'خطا در آپلود امضا')
  }
}
