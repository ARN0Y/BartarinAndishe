export function formatAnnouncementStudents(announcement) {
  const list = announcement?.recipients?.map((r) => r.student).filter(Boolean) || []
  if (!list.length) return '—'
  return list.map((s) => `${s.firstName} ${s.lastName}`).join('، ')
}
