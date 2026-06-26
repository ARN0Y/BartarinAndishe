import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { studentId } = await params
    const sid = Number(studentId)

    const student = await prisma.student.findUnique({ where: { id: sid } })
    if (!student) return Response.json({ message: 'نوآموز یافت نشد.' }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get('photo')

    if (!file || typeof file === 'string') {
      return Response.json({ message: 'فایل عکس ارسال نشده.' }, { status: 422 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowed.includes(ext)) {
      return Response.json({ message: 'فرمت تصویر باید jpg، png یا webp باشد.' }, { status: 422 })
    }

    if (file.size > 3 * 1024 * 1024) {
      return Response.json({ message: 'حجم عکس نباید بیشتر از ۳ مگابایت باشد.' }, { status: 422 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'students')
    await mkdir(uploadDir, { recursive: true })

    const filename = `student_${sid}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const photoUrl = `/uploads/students/${filename}`

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
