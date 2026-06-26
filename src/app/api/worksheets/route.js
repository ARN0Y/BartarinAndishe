import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { createWorksheet, listWorksheets } from '@/lib/services/worksheetService'
import { z } from 'zod'

const worksheetSchema = z.object({
  title: z.string().min(2, 'عنوان الزامی است.'),
  description: z.string().min(2, 'توضیحات الزامی است.'),
})

export async function GET() {
  try {
    return Response.json({ worksheets: await listWorksheets() })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت کاربرگ‌ها')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const formData = await request.formData()
    const payload = worksheetSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
    })
    const worksheet = await createWorksheet({
      ...payload,
      file: formData.get('file'),
    })
    return Response.json({ worksheet }, { status: 201 })
  } catch (error) {
    return jsonError(error, 'خطا در ایجاد کاربرگ')
  }
}
