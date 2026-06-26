import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { saveUploadedImage } from '@/lib/uploadImage'

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { studentId } = await params
    const sid = Number(studentId)

    const student = await prisma.student.findUnique({ where: { id: sid } })
    if (!student) return Response.json({ message: 'نوآموز یافت نشد.' }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get('photo')

    const photoUrl = await saveUploadedImage(file, {
      uploadDir: 'uploads/students',
      filename: `student_${sid}`,
      maxWidth: 900,
      maxHeight: 900,
      quality: 82,
    })

    await prisma.studentProfile.upsert({
      where: { studentId: sid },
      update: { photoUrl },
      create: { studentId: sid, photoUrl },
    })

    return Response.json({ ok: true, photoUrl })
  } catch (error) {
    return jsonError(error, 'خطا در آپلود عکس')
  }
}
