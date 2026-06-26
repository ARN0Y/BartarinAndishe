import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { listClasses, createClass, getStudentsForAssignment } from '@/lib/services/classService'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    const [classes, students] = await Promise.all([
      listClasses(academicYear),
      getStudentsForAssignment(academicYear),
    ])
    return Response.json({ classes, students })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت کلاس‌ها')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    const body = await request.json()
    const cls = await createClass(academicYear, body)
    return Response.json({ ok: true, class: cls })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد کلاس')
  }
}
