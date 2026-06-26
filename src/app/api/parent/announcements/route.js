import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getActiveStudentAnnouncements } from '@/lib/services/announcementService'

export async function GET() {
  try {
    const session = await requireParent()
    const announcements = await getActiveStudentAnnouncements(session.studentId)
    return Response.json({ announcements })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اعلان‌ها')
  }
}
