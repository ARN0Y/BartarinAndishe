import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { createMessages, listAdminMessages } from '@/lib/services/messageService'

export async function GET() {
  try {
    await requireAdmin()
    return Response.json({ messages: await listAdminMessages() })
  } catch (e) {
    return jsonError(e, 'خطا')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      let toStudentIds
      const rawIds = formData.get('toStudentIds')
      if (rawIds) {
        try {
          toStudentIds = JSON.parse(String(rawIds))
        } catch {
          toStudentIds = undefined
        }
      }
      const result = await createMessages({
        subject: formData.get('subject'),
        body: formData.get('body'),
        toStudentIds,
        attachment: formData.get('attachment'),
      })
      return Response.json(result)
    }

    const { subject, body, toStudentId, toStudentIds } = await request.json()
    const ids = Array.isArray(toStudentIds) && toStudentIds.length
      ? toStudentIds
      : toStudentId
        ? [toStudentId]
        : undefined

    const result = await createMessages({ subject, body, toStudentIds: ids })
    return Response.json(result)
  } catch (e) {
    return jsonError(e, 'خطا')
  }
}
