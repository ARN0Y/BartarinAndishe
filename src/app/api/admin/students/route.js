import { requireAdmin } from '@/lib/api/guards'
import { jsonError, AppError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { getAllStudentsWithPayments } from '@/lib/services/manualPaymentService'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { getGradeRangesForYear } from '@/lib/services/gradeRangeService'
import { resolveGradeFields } from '@/lib/gradeLevel'
import { findDuplicateStudentCode, formatStudentCodeConflictMessage } from '@/lib/studentCode'
import { onlyEnglishDigits, toEnglishDigits } from '@/lib/digits'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    return Response.json({ students: await getAllStudentsWithPayments(academicYear) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت لیست نوآموزان')
  }
}

/** افزودن دستی نوآموز ثبت‌نام قطعی (ثبت حضوری توسط مدیر) */
export async function POST(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))
    const body = await request.json()

    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    const nationalId = onlyEnglishDigits(body.nationalId)
    const studentCode = String(body.studentCode || '').trim()
    const phone = onlyEnglishDigits(body.phone)
    const birthDate = toEnglishDigits(body.birthDate || '').trim()
    const gender = String(body.gender || '').trim()

    if (!firstName || !lastName) throw new AppError(422, 'نام و نام خانوادگی الزامی است.')
    if (!/^\d{10}$/.test(nationalId)) throw new AppError(422, 'کد ملی باید ۱۰ رقم باشد.')

    // یکتایی کد ملی در سال
    const dupNid = await prisma.student.findFirst({ where: { nationalId, academicYear } })
    if (dupNid) throw new AppError(422, 'این کد ملی در همین سال تحصیلی قبلاً ثبت شده است.')

    // یکتایی کد نوآموز در سال
    if (studentCode) {
      const dupCode = await findDuplicateStudentCode(prisma, { code: studentCode, academicYear })
      if (dupCode) throw new AppError(422, formatStudentCodeConflictMessage(studentCode, dupCode))
    }

    // محاسبهٔ پایه بر اساس تاریخ تولد (در صورت وجود)
    let gradeKey = null
    let gradeLevel = null
    if (birthDate) {
      const ranges = await getGradeRangesForYear(academicYear)
      const resolved = resolveGradeFields(birthDate, ranges)
      gradeKey = resolved.gradeKey
      gradeLevel = resolved.gradeLevel
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        nationalId,
        studentCode: studentCode || null,
        academicYear,
        registrationStatus: 'Confirmed',
      },
    })

    // ثبت یک رکورد پیش‌ثبت‌نام متناظر (برای نگه‌داری تاریخ تولد/جنسیت/پایه و گزارش‌ها)
    await prisma.preRegistration.create({
      data: {
        firstName,
        lastName,
        nationalId,
        phone: phone || '-',
        birthDate: birthDate || '',
        gender: gender || '',
        gradeKey,
        gradeLevel,
        status: 'Confirmed',
        academicYear,
        studentId: student.id,
      },
    })

    return Response.json({ ok: true, studentId: student.id })
  } catch (error) {
    if (error?.code === 'P2002') {
      return Response.json({ message: 'این کد ملی یا کد نوآموز در همین سال قبلاً ثبت شده است.' }, { status: 422 })
    }
    return jsonError(error, 'خطا در افزودن نوآموز')
  }
}
