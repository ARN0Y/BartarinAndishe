import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { assignStudentToClass } from '@/lib/services/classService'

export async function POST(request) {
  try {
    await requireAdmin()
    const { studentId, classId } = await request.json()
    if (!studentId) return Response.json({ message: 'شناسهٔ نوآموز الزامی است.' }, { status: 422 })
    await assignStudentToClass(Number(studentId), classId == null ? null : Number(classId))
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در انتساب نوآموز به کلاس')
  }
}
