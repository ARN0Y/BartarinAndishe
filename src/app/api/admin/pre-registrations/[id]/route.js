import { requireAdmin } from '@/lib/api/guards'
import { jsonError, AppError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { getGradeRangesForYear } from '@/lib/services/gradeRangeService'
import { resolveGradeFields } from '@/lib/gradeLevel'
import {
  findDuplicateStudentCode,
  formatStudentCodeConflictMessage,
} from '@/lib/studentCode'

/** PATCH: confirm (nationalId required) or reject */
export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id: rawId } = await params
    const body = await request.json()
    const { action, nationalId, firstName, lastName, phone, birthDate, gender, studentCode } = body
    const id = Number(rawId)

    const reg = await prisma.preRegistration.findUnique({ where: { id } })
    if (!reg) throw new AppError(404, 'پیش ثبت‌نام یافت نشد.')

    if (action === 'update') {
      const academicYear = normalizeAcademicYear(reg.academicYear)
      const ranges = await getGradeRangesForYear(academicYear)
      const nextBirthDate = birthDate !== undefined ? birthDate || '' : reg.birthDate
      const { gradeKey, gradeLevel } = resolveGradeFields(nextBirthDate, ranges)

      await prisma.preRegistration.update({
        where: { id },
        data: {
          ...(firstName?.trim() && { firstName: firstName.trim() }),
          ...(lastName?.trim() && { lastName: lastName.trim() }),
          ...(nationalId !== undefined && { nationalId: nationalId?.trim() || null }),
          ...(phone?.trim() && { phone: phone.trim() }),
          ...(birthDate !== undefined && { birthDate: birthDate || '' }),
          ...(gender !== undefined && { gender: gender || '' }),
          ...(birthDate !== undefined && { gradeKey, gradeLevel }),
        },
      })
      return Response.json({ ok: true })
    }

    if (action === 'reject') {
      await prisma.preRegistration.update({ where: { id }, data: { status: 'Rejected' } })
      return Response.json({ ok: true })
    }

    if (action === 'confirm') {
      const resolvedNationalId = (nationalId?.trim() || reg.nationalId?.trim() || '')
      if (!resolvedNationalId) {
        return Response.json({ message: 'کد ملی نوآموز الزامی است.' }, { status: 422 })
      }

      const code = String(body.studentCode || '').trim()
      if (!code) {
        return Response.json({ message: 'کد نوآموز الزامی است.' }, { status: 422 })
      }

      const academicYear = normalizeAcademicYear(reg.academicYear)

      const codeDup = await findDuplicateStudentCode(prisma, { code, academicYear })
      if (codeDup && codeDup.nationalId !== resolvedNationalId) {
        return Response.json(
          { message: formatStudentCodeConflictMessage(code, codeDup) },
          { status: 422 },
        )
      }

      const existing = await prisma.student.findFirst({
        where: { nationalId: resolvedNationalId, academicYear },
      })
      let student = existing

      if (!student) {
        student = await prisma.student.create({
          data: {
            firstName: (firstName || reg.firstName).trim(),
            lastName: (lastName || reg.lastName).trim(),
            nationalId: resolvedNationalId,
            studentCode: code,
            academicYear,
            registrationStatus: 'Confirmed',
          },
        })
      } else {
        student = await prisma.student.update({
          where: { id: student.id },
          data: {
            registrationStatus: 'Confirmed',
            studentCode: code,
          },
        })
      }

      await prisma.preRegistration.update({
        where: { id },
        data: { status: 'Confirmed', studentId: student.id },
      })

      return Response.json({ ok: true, studentId: student.id })
    }

    return Response.json({ message: 'عملیات نامعتبر.' }, { status: 400 })
  } catch (error) {
    return jsonError(error, 'خطا در پردازش پیش ثبت‌نام')
  }
}

/** DELETE */
export async function DELETE(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    await prisma.preRegistration.delete({ where: { id: Number(id) } })
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در حذف')
  }
}
