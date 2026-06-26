import { NextResponse } from 'next/server'
import { attachSessionCookie } from '@/lib/auth/session'
import { jsonError } from '@/lib/errors'
import { loginParent } from '@/lib/services/authService'
import { parentLoginSchema } from '@/lib/validators/auth'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = checkRateLimit(ip, 'parent-login')

    if (!allowed) {
      return Response.json(
        { message: 'تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.' },
        { status: 429 },
      )
    }

    const body = parentLoginSchema.parse(await request.json())
    const result = await loginParent(body)
    const response = NextResponse.json({ student: result.student })
    return attachSessionCookie(response, result.token, 'parent')
  } catch (error) {
    return jsonError(error, 'خطا در ورود والدین')
  }
}
