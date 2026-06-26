import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { changeParentPassword, hasCustomPassword } from '@/lib/services/parentPasswordService'

export async function GET() {
  try {
    const session = await requireParent()
    const student = await prisma.student.findUnique({
      where: { id: Number(session.studentId) },
      select: { parentPasswordHash: true },
    })
    return Response.json({ hasCustomPassword: hasCustomPassword(student) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت وضعیت رمز')
  }
}

export async function PUT(request) {
  try {
    const session = await requireParent()
    const { currentPassword, newPassword } = await request.json()
    await changeParentPassword(Number(session.studentId), { currentPassword, newPassword })
    return Response.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'خطا در تغییر رمز عبور')
  }
}
