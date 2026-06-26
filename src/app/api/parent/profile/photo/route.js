import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { saveUploadedImage } from '@/lib/uploadImage'

export async function POST(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)

    const formData = await request.formData()
    const file = formData.get('photo')

    const photoUrl = await saveUploadedImage(file, {
      uploadDir: 'uploads/students',
      filename: `student_${studentId}`,
      maxWidth: 900,
      maxHeight: 900,
      quality: 82,
    })

    await prisma.studentProfile.upsert({
      where: { studentId },
      update: { photoUrl },
      create: { studentId, photoUrl },
    })

    return Response.json({ ok: true, photoUrl })
  } catch (error) {
    return jsonError(error, 'خطا در آپلود عکس')
  }
}
