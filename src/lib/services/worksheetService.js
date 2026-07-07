import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/formatters'
import { AppError } from '@/lib/errors'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'worksheets')
const MAX_IMAGE_DOC_SIZE = 10 * 1024 * 1024 // عکس/PDF: ۱۰ مگابایت
const MAX_VIDEO_SIZE = 60 * 1024 * 1024 // فیلم: ۶۰ مگابایت
// کاربرگ‌های فایلی: فقط عکس، PDF و فیلم
const ALLOWED_TYPES = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/jpg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
  ['video/mp4', new Set(['.mp4'])],
  ['video/webm', new Set(['.webm'])],
  ['video/quicktime', new Set(['.mov'])],
])

function validateWorksheetFile(file) {
  if (!file || typeof file === 'string') {
    throw new AppError(400, 'فایل کاربرگ الزامی است.')
  }

  const mimeType = String(file.type || '').toLowerCase()
  const ext = path.extname(file.name || '').toLowerCase()
  const allowedExtensions = ALLOWED_TYPES.get(mimeType)

  if (!allowedExtensions?.has(ext)) {
    throw new AppError(400, 'فرمت فایل مجاز نیست. (عکس: JPG/PNG/WEBP، سند: PDF، فیلم: MP4/WEBM/MOV)')
  }

  const isVideo = mimeType.startsWith('video/')
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_DOC_SIZE
  if (file.size > maxSize) {
    throw new AppError(400, isVideo ? 'حداکثر حجم فیلم ۶۰ مگابایت است.' : 'حداکثر حجم فایل ۱۰ مگابایت است.')
  }

  return { ext, mimeType }
}

async function saveWorksheetFile(file) {
  const { ext, mimeType } = validateWorksheetFile(file)
  await mkdir(UPLOAD_DIR, { recursive: true })

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const diskPath = path.join(UPLOAD_DIR, safeName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(diskPath, buffer)

  return {
    fileUrl: `/uploads/worksheets/${safeName}`,
    fileName: path.basename(file.name),
    mimeType,
    diskPath,
  }
}

async function unlinkIfExists(diskPath) {
  try {
    await unlink(diskPath)
  } catch {
    /* ignore */
  }
}

export async function listWorksheets({ visibleOnly = false } = {}) {
  const items = await prisma.worksheet.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return items.map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    fileUrl: w.fileUrl,
    fileName: w.fileName,
    mimeType: w.mimeType,
    isVisible: w.isVisible,
    createdAt: w.createdAt,
    createdAtFormatted: formatDate(w.createdAt),
  }))
}

export async function setWorksheetVisibility(id, isVisible) {
  const existing = await prisma.worksheet.findUnique({ where: { id } })
  if (!existing) throw new AppError(404, 'کاربرگ یافت نشد.')
  return prisma.worksheet.update({
    where: { id },
    data: { isVisible: Boolean(isVisible) },
  })
}

export async function createWorksheet({ title, description, file }) {
  const saved = await saveWorksheetFile(file)

  return prisma.worksheet.create({
    data: {
      title,
      description,
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
    },
  })
}

export async function updateWorksheet(id, { title, description, file }) {
  const existing = await prisma.worksheet.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'کاربرگ یافت نشد.')
  }

  if (file && typeof file !== 'string') {
    const oldPath = path.join(process.cwd(), 'public', existing.fileUrl)
    const saved = await saveWorksheetFile(file)

    try {
      const updated = await prisma.worksheet.update({
        where: { id },
        data: {
          title,
          description,
          fileUrl: saved.fileUrl,
          fileName: saved.fileName,
          mimeType: saved.mimeType,
        },
      })
      await unlinkIfExists(oldPath)
      return updated
    } catch (error) {
      await unlinkIfExists(saved.diskPath)
      throw error
    }
  }

  return prisma.worksheet.update({
    where: { id },
    data: { title, description },
  })
}

export async function deleteWorksheet(id) {
  const existing = await prisma.worksheet.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'کاربرگ یافت نشد.')
  }

  const diskPath = path.join(process.cwd(), 'public', existing.fileUrl)
  await unlinkIfExists(diskPath)

  await prisma.worksheet.delete({ where: { id } })
  return { ok: true }
}
