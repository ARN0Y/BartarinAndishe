import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { saveUploadedImage } from '@/lib/uploadImage'

export async function POST(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)

    const existing = await prisma.tuitionContract.findUnique({ where: { studentId } })
    if (existing) {
      return Response.json({ message: 'قرارداد قبلاً ثبت شده است.' }, { status: 409 })
    }

    const formData = await request.formData()
    const file = formData.get('signature')

    const url = await saveUploadedImage(file, {
      uploadDir: 'uploads/contract/parents',
      filename: `parent_${studentId}`,
    })

    return Response.json({ ok: true, parentSignatureUrl: url })
  } catch (error) {
    return jsonError(error, error.message || 'خطا در آپلود امضا')
  }
}
