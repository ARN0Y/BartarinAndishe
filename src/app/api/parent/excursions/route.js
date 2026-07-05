import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { getParentExcursions } from '@/lib/services/excursionConsentService'

export async function GET() {
  try {
    const session = await requireParent()
    return Response.json({ excursions: await getParentExcursions(Number(session.studentId)) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اردوها')
  }
}
