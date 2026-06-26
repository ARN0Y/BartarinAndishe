import { prisma } from '@/lib/prisma'
import { jsonError } from '@/lib/errors'
import { formatDate } from '@/lib/formatters'
import { checkRateLimit } from '@/lib/rateLimit'

const MAX_NAME = 40
const MAX_TEXT = 400

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return Response.json({
      comments: comments.map((c) => ({
        id: c.id,
        name: c.name,
        text: c.text,
        createdAtFormatted: formatDate(c.createdAt),
      })),
    })
  } catch (error) {
    return jsonError(error, 'خطا در بارگذاری نظرات')
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = checkRateLimit(ip, 'pre-register')
    if (!allowed) {
      return Response.json({ message: 'تعداد درخواست‌ها بیش از حد مجاز است.' }, { status: 429 })
    }

    const body = await request.json()
    const name = String(body.name ?? '').trim().slice(0, MAX_NAME)
    const text = String(body.text ?? '').trim().slice(0, MAX_TEXT)

    if (name.length < 2) {
      return Response.json({ message: 'نام باید حداقل ۲ کاراکتر باشد' }, { status: 422 })
    }
    if (text.length < 5) {
      return Response.json({ message: 'متن نظر باید حداقل ۵ کاراکتر باشد' }, { status: 422 })
    }

    await prisma.comment.create({ data: { name, text, approved: false } })

    return Response.json({ ok: true, message: 'نظر شما دریافت شد و بعد از تأیید نمایش داده می‌شود.' })
  } catch (error) {
    return jsonError(error, 'خطا در ثبت نظر')
  }
}
