import { NextResponse } from 'next/server'
import { attachSessionCookie } from '@/lib/auth/session'
import { jsonError } from '@/lib/errors'
import { loginAdmin } from '@/lib/services/authService'
import { adminLoginSchema } from '@/lib/validators/auth'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed, remaining } = checkRateLimit(ip, 'admin-login')

    if (!allowed) {
      return Response.json(
        { message: 'تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } },
      )
    }

    const body = adminLoginSchema.parse(await request.json())
    const result = await loginAdmin(body)
    const response = NextResponse.json({ admin: result.admin })
    return attachSessionCookie(response, result.token, 'admin')
  } catch (error) {
    return jsonError(error, 'خطا در ورود مدیر')
  }
}
