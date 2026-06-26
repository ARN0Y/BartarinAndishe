import { requireSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireSession('parent')
    const messages = await prisma.message.findMany({
      where: { toStudentId: session.studentId },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json({ messages })
  } catch {
    return Response.json({ message: 'دسترسی مجاز نیست.' }, { status: 401 })
  }
}

export async function PATCH(request) {
  try {
    const session = await requireSession('parent')
    const { ids } = await request.json()
    await prisma.message.updateMany({
      where: { id: { in: ids }, toStudentId: session.studentId },
      data: { isRead: true },
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ message: 'خطا' }, { status: 500 })
  }
}
