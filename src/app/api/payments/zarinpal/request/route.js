import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { startZarinpalPayment } from '@/lib/services/paymentService'
import { paymentRequestSchema } from '@/lib/validators/auth'

export async function POST(request) {
  try {
    const session = await requireParent()
    const { amount } = paymentRequestSchema.parse(await request.json())
    return Response.json(await startZarinpalPayment(Number(session.studentId), amount))
  } catch (error) {
    return jsonError(error, 'خطا در اتصال به درگاه پرداخت')
  }
}
