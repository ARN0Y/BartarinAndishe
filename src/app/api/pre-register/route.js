import { prisma } from '@/lib/prisma'
import { jsonError } from '@/lib/errors'
import { getActiveAcademicYear } from '@/lib/academicYear'
import { getGradeRangesForYear } from '@/lib/services/gradeRangeService'
import { resolveGradeFields } from '@/lib/gradeLevel'
import { checkRateLimit } from '@/lib/rateLimit'
import { onlyEnglishDigits, toEnglishDigits } from '@/lib/digits'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = checkRateLimit(ip, 'pre-register')
    if (!allowed) {
      return Response.json(
        { message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' },
        { status: 429 },
      )
    }

    const { firstName, lastName, nationalId, phone, birthDate, gender } = await request.json()
    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
      return Response.json({ message: 'نام، نام خانوادگی و شماره تماس الزامی است.' }, { status: 422 })
    }

    const trimmedPhone = onlyEnglishDigits(phone)
    if (!/^09\d{9}$/.test(trimmedPhone)) {
      return Response.json({ message: 'شماره تماس باید ۱۱ رقمی و با ۰۹ شروع شود.' }, { status: 422 })
    }

    const academicYear = await getActiveAcademicYear()
    const ranges = await getGradeRangesForYear(academicYear)
    const birth = toEnglishDigits(birthDate?.trim() || '')
    const normalizedNationalId = nationalId ? onlyEnglishDigits(nationalId) : null
    const { gradeKey, gradeLevel } = resolveGradeFields(birth, ranges)

    const reg = await prisma.preRegistration.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: normalizedNationalId,
        phone: trimmedPhone,
        birthDate: birth,
        gender: gender?.trim() || '',
        gradeKey,
        gradeLevel,
        academicYear,
      },
    })
    return Response.json({ ok: true, id: reg.id, gradeLevel: reg.gradeLevel }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در ثبت پیش ثبت‌نام')
  }
}
