import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { verifyExcursionOtp } from '@/lib/services/excursionConsentService'

export async function POST(request, { params }) {
  try {
    const session = await requireParent()
    const { id } = await params
    const result = await verifyExcursionOtp(Number(session.studentId), Number(id), await request.json())
    return Response.json(result)
  } catch (error) {
    return jsonError(error, 'خطا در بررسی کد تایید')
  }
}
