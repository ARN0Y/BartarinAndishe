import { jsonError } from '@/lib/errors'
import { resetParentPasswordToNationalId } from '@/lib/services/parentPasswordService'
import { checkRateLimit } from '@/lib/rateLimit'
import { onlyEnglishDigits } from '@/lib/digits'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = checkRateLimit(ip, 'parent-forgot')
    if (!allowed) {
      return Response.json(
        { message: 'تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.' },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const nationalId = onlyEnglishDigits(body.nationalId)
    await resetParentPasswordToNationalId(nationalId)

    return Response.json({
      ok: true,
      message: 'رمز عبور شما به کد ملی نوآموز بازنشانی شد. اکنون با کد ملی نوآموز وارد شوید.',
    })
  } catch (error) {
    return jsonError(error, 'خطا در بازنشانی رمز عبور')
  }
}
