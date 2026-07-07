import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { sendContractOtp } from '@/lib/services/contractOtpService'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)

    const { allowed } = checkRateLimit(`student:${studentId}`, 'otp-send')
    if (!allowed) {
      return Response.json(
        { message: 'تعداد درخواست کد تایید بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.' },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const signerRole = body.signerRole === 'mother' ? 'mother' : 'father'
    const result = await sendContractOtp(studentId, { signerRole })
    return Response.json(result)
  } catch (error) {
    return jsonError(error, 'خطا در ارسال کد تایید')
  }
}
