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

    const normalizedNationalId = nationalId ? onlyEnglishDigits(nationalId) : null
    if (normalizedNationalId && !/^\d{10}$/.test(normalizedNationalId)) {
      return Response.json({ message: 'کد ملی نوآموز باید ۱۰ رقم باشد یا خالی بماند.' }, { status: 422 })
    }

    const academicYear = await getActiveAcademicYear()
    const ranges = await getGradeRangesForYear(academicYear)
    const birth = toEnglishDigits(birthDate?.trim() || '')
    const { gradeKey, gradeLevel } = resolveGradeFields(birth, ranges)

    const fn = firstName.trim()
    const ln = lastName.trim()
    const data = {
      firstName: fn,
      lastName: ln,
      nationalId: normalizedNationalId,
      phone: trimmedPhone,
      birthDate: birth,
      gender: gender?.trim() || '',
      gradeKey,
      gradeLevel,
      academicYear,
    }

    // جلوگیری از پیش‌ثبت‌نام تکراری برای همان نوآموز در همان سال تحصیلی:
    // کلید تشخیص = کد ملی (در صورت وجود) وگرنه شمارهٔ تماس + نام و نام‌خانوادگی
    // (تا خواهر/برادرها با کد ملی یا نام متفاوت، جداگانه ثبت شوند).
    const dupWhere = normalizedNationalId
      ? { academicYear, nationalId: normalizedNationalId }
      : { academicYear, phone: trimmedPhone, firstName: fn, lastName: ln }
    const existing = await prisma.preRegistration.findFirst({
      where: dupWhere,
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      if (existing.status === 'Confirmed') {
        return Response.json(
          { message: 'این نوآموز قبلاً ثبت‌نام شده است. برای پیگیری با مدیریت تماس بگیرید.' },
          { status: 409 },
        )
      }
      // پیش‌ثبت‌نام در انتظار موجود است → به‌جای ردیف تکراری، همان را با اطلاعات جدید به‌روزرسانی کن.
      const updated = await prisma.preRegistration.update({ where: { id: existing.id }, data })
      return Response.json({ ok: true, id: updated.id, gradeLevel: updated.gradeLevel, updated: true }, { status: 200 })
    }

    const reg = await prisma.preRegistration.create({ data })
    return Response.json({ ok: true, id: reg.id, gradeLevel: reg.gradeLevel }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در ثبت پیش ثبت‌نام')
  }
}
