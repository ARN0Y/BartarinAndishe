import { getActiveAnnouncements } from '@/lib/services/announcementService'

export async function GET() {
  const announcements = await getActiveAnnouncements()
  return Response.json({ announcements })
}
