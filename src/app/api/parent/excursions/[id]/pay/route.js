import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { startExcursionPayment } from '@/lib/services/excursionConsentService'

export async function POST(_, { params }) {
  try {
    const session = await requireParent()
    const { id } = await params
    const result = await startExcursionPayment(Number(session.studentId), Number(id))
    return Response.json(result)
  } catch (error) {
    return jsonError(error, 'خطا در شروع پرداخت اردو')
  }
}
