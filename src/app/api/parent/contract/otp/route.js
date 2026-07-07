import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { sendContractOtp } from '@/lib/services/contractOtpService'

export async function POST(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)
    const body = await request.json().catch(() => ({}))
    const signerRole = body.signerRole === 'mother' ? 'mother' : 'father'
    const result = await sendContractOtp(studentId, { signerRole })
    return Response.json(result)
  } catch (error) {
    return jsonError(error, 'خطا در ارسال کد تایید')
  }
}
