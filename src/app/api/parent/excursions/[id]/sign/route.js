import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { signExcursionConsent } from '@/lib/services/excursionConsentService'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request, { params }) {
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

    const { id } = await params
    const result = await signExcursionConsent(studentId, Number(id), await request.json())
    return Response.json(result)
  } catch (error) {
    return jsonError(error, 'خطا در ثبت رضایت‌نامه')
  }
}
