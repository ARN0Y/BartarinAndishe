import { requireAdmin } from '@/lib/api/guards'
import { jsonError, AppError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { getStudentInvoice } from '@/lib/services/manualPaymentService'
import {
  findDuplicateStudentCode,
  formatStudentCodeConflictMessage,
} from '@/lib/studentCode'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const student = await getStudentInvoice(Number(id))
    return Response.json({ student })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت اطلاعات مالی')
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const studentId = Number(id)

    const data = {}
    if ('totalTuition' in body) {
      data.totalTuition = body.totalTuition ? Number(body.totalTuition) : null
    }
    if (body.firstName?.trim()) data.firstName = body.firstName.trim()
    if (body.lastName?.trim()) data.lastName = body.lastName.trim()
    if (body.nationalId?.trim()) {
      const nid = body.nationalId.trim()
      const current = await prisma.student.findUnique({ where: { id: studentId } })
      const dup = await prisma.student.findFirst({
        where: {
          nationalId: nid,
          academicYear: current?.academicYear,
          NOT: { id: studentId },
        },
      })
      if (dup) throw new AppError(422, 'این کد ملی در همین سال تحصیلی قبلاً ثبت شده است.')
      data.nationalId = nid
    }
    if ('studentCode' in body) {
      const current = await prisma.student.findUnique({ where: { id: studentId } })
      if (!current) throw new AppError(404, 'نوآموز یافت نشد.')
      const code = body.studentCode?.trim() || null
      if (code) {
        const dup = await findDuplicateStudentCode(prisma, {
          code,
          academicYear: current.academicYear,
          excludeStudentId: studentId,
        })
        if (dup) {
          throw new AppError(422, formatStudentCodeConflictMessage(code, dup))
        }
      }
      data.studentCode = code
    }

    if (!Object.keys(data).length) {
      return Response.json({ message: 'فیلدی برای ویرایش ارسال نشده.' }, { status: 422 })
    }

    await prisma.student.update({ where: { id: studentId }, data })
    return Response.json({ ok: true })
  } catch (error) {
    if (error?.code === 'P2002' && error?.meta?.target?.includes('studentCode')) {
      return Response.json(
        { message: 'این کد نوآموز در همین سال تحصیلی قبلاً ثبت شده است.' },
        { status: 422 },
      )
    }
    return jsonError(error, 'خطا در ویرایش نوآموز')
  }
}
