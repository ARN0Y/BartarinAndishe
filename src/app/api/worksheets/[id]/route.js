import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { deleteWorksheet, setWorksheetVisibility, updateWorksheet } from '@/lib/services/worksheetService'
import { z } from 'zod'

const worksheetSchema = z.object({
  title: z.string().min(2, 'عنوان الزامی است.'),
  description: z.string().min(2, 'توضیحات الزامی است.'),
})

export async function PATCH(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { isVisible } = await request.json()
    const worksheet = await setWorksheetVisibility(Number(id), isVisible)
    return Response.json({ worksheet })
  } catch (error) {
    return jsonError(error, 'خطا در تغییر وضعیت نمایش')
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const formData = await request.formData()
    const payload = worksheetSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
    })
    const worksheet = await updateWorksheet(Number(id), {
      ...payload,
      file: formData.get('file'),
    })
    return Response.json({ worksheet })
  } catch (error) {
    return jsonError(error, 'خطا در ویرایش کاربرگ')
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    return Response.json(await deleteWorksheet(Number(id)))
  } catch (error) {
    return jsonError(error, 'خطا در حذف کاربرگ')
  }
}
