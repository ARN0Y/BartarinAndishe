import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { saveUploadedImage } from '@/lib/uploadImage'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'messages')

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/zip',
  'text/plain',
]

const MAX_SIZE = 10 * 1024 * 1024
const IMAGE_MIME_PREFIX = 'image/'

const EXT_MIME = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.txt': 'text/plain',
}

function resolveMimeType(file) {
  const type = file?.type?.toLowerCase?.() || ''
  if (type && type !== 'application/octet-stream') return type
  const ext = path.extname(file?.name || '').toLowerCase()
  return EXT_MIME[ext] || type
}

function formatMessage(message) {
  return {
    id: message.id,
    subject: message.subject,
    body: message.body,
    attachmentUrl: message.attachmentUrl,
    attachmentName: message.attachmentName,
    toStudentId: message.toStudentId,
    student: message.student,
    isRead: message.isRead,
    createdAt: message.createdAt,
  }
}

async function saveAttachment(file) {
  if (!file || typeof file === 'string' || !(file.size > 0)) {
    return { attachmentUrl: null, attachmentName: null }
  }

  const mimeType = resolveMimeType(file)
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new AppError(400, 'فرمت فایل مجاز نیست. (PDF, تصویر, Word, Excel, ZIP, TXT)')
  }

  if (file.size > MAX_SIZE) {
    throw new AppError(400, 'حداکثر حجم فایل ضمیمه ۱۰ مگابایت است.')
  }

  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  if (mimeType.startsWith(IMAGE_MIME_PREFIX)) {
    return {
      attachmentUrl: await saveUploadedImage(file, {
        uploadDir: 'uploads/messages',
        filename: baseName,
        maxSize: MAX_SIZE,
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 82,
      }),
      attachmentName: file.name,
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true })
  const ext = path.extname(file.name) || '.bin'
  const safeName = `${baseName}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, safeName), buffer)

  return {
    attachmentUrl: `/uploads/messages/${safeName}`,
    attachmentName: file.name,
  }
}

export async function listAdminMessages() {
  const messages = await prisma.message.findMany({
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return messages.map(formatMessage)
}

export async function createMessages({ subject, body, toStudentIds, attachment }) {
  const trimmedSubject = String(subject || '').trim()
  const trimmedBody = String(body || '').trim()
  if (!trimmedSubject || !trimmedBody) {
    throw new AppError(422, 'موضوع و متن پیام اجباری است.')
  }

  const { attachmentUrl, attachmentName } = await saveAttachment(attachment)

  const attachmentData = attachmentUrl
    ? { attachmentUrl, attachmentName }
    : {}

  let ids = null
  if (Array.isArray(toStudentIds) && toStudentIds.length) {
    ids = [...new Set(toStudentIds.map(Number).filter(Boolean))]
  }

  if (ids?.length) {
    const found = await prisma.student.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    })
    if (found.length !== ids.length) {
      throw new AppError(404, 'یک یا چند نوآموز یافت نشد.')
    }

    if (ids.length === 1) {
      const msg = await prisma.message.create({
        data: {
          subject: trimmedSubject,
          body: trimmedBody,
          toStudentId: ids[0],
          ...attachmentData,
        },
      })
      return { message: formatMessage(msg), count: 1 }
    }

    await prisma.message.createMany({
      data: ids.map((id) => ({
        subject: trimmedSubject,
        body: trimmedBody,
        toStudentId: id,
        ...attachmentData,
      })),
    })
    return { ok: true, count: ids.length }
  }

  const students = await prisma.student.findMany({ select: { id: true } })
  if (!students.length) {
    throw new AppError(422, 'هیچ نوآموزی برای ارسال پیام وجود ندارد.')
  }

  await prisma.message.createMany({
    data: students.map((s) => ({
      subject: trimmedSubject,
      body: trimmedBody,
      toStudentId: s.id,
      ...attachmentData,
    })),
  })
  return { ok: true, count: students.length }
}

export async function deleteMessage(id) {
  await prisma.message.delete({ where: { id: Number(id) } })
  return { ok: true }
}
