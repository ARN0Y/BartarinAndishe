import { requireAdmin } from '@/lib/api/guards'
import { jsonError, AppError } from '@/lib/errors'
import { createAnnouncement, listAdminAnnouncements } from '@/lib/services/announcementService'

export async function GET() {
  try {
    await requireAdmin()
    const data = await listAdminAnnouncements()
    return Response.json(data)
  } catch (e) {
    return jsonError(e, 'خطا')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const { text, scope, studentId, studentIds } = await request.json()
    if (!text?.trim()) {
      return Response.json({ message: 'متن اعلان را وارد کنید.' }, { status: 422 })
    }
    const ids = studentIds ?? (studentId ? [studentId] : undefined)
    const ann = await createAnnouncement({ text, scope: scope || 'public', studentIds: ids })
    return Response.json({ announcement: ann })
  } catch (e) {
    if (e instanceof AppError) return jsonError(e, e.message)
    return jsonError(e, e.message || 'خطا')
  }
}
