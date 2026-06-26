import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { AppError } from '@/lib/errors'

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public')
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function assertInsidePublic(targetPath) {
  const resolved = path.resolve(targetPath)
  if (resolved !== PUBLIC_ROOT && !resolved.startsWith(`${PUBLIC_ROOT}${path.sep}`)) {
    throw new AppError(400, 'مسیر آپلود نامعتبر است.')
  }
  return resolved
}

function safeFilename(filename, ext) {
  const parsed = path.parse(path.basename(String(filename || 'image')))
  const base = (parsed.name || 'image')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'image'
  const requestedExt = (parsed.ext || `.${ext}`).slice(1).toLowerCase()
  const finalExt = ALLOWED_EXTENSIONS.has(requestedExt) ? requestedExt : ext
  return `${base}.${finalExt}`
}

function hasImageSignature(buffer, ext) {
  if (ext === 'jpg' || ext === 'jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }
  if (ext === 'png') {
    return buffer.length >= 8
      && buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47
      && buffer[4] === 0x0d
      && buffer[5] === 0x0a
      && buffer[6] === 0x1a
      && buffer[7] === 0x0a
  }
  if (ext === 'webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  }
  return false
}

export async function saveUploadedImage(file, { uploadDir, filename, maxSize = 3 * 1024 * 1024 }) {
  if (!file || typeof file === 'string') {
    throw new AppError(422, 'فایل تصویر ارسال نشده.')
  }

  const mimeType = file.type?.toLowerCase?.() || ''
  const ext = path.extname(file.name || '').slice(1).toLowerCase() || MIME_EXTENSIONS[mimeType] || 'jpg'
  if (!ALLOWED_EXTENSIONS.has(ext) || (mimeType && !ALLOWED_MIME_TYPES.has(mimeType))) {
    throw new AppError(422, 'فرمت تصویر باید jpg، png یا webp باشد.')
  }

  if (file.size > maxSize) {
    throw new AppError(422, 'حجم عکس نباید بیشتر از ۳ مگابایت باشد.')
  }

  const dir = assertInsidePublic(path.join(PUBLIC_ROOT, uploadDir))
  await mkdir(dir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!hasImageSignature(buffer, ext)) {
    throw new AppError(422, 'محتوای فایل با فرمت تصویر ارسالی سازگار نیست.')
  }

  const safeName = safeFilename(filename, ext)
  await writeFile(assertInsidePublic(path.join(dir, safeName)), buffer)

  return `/${uploadDir.replace(/\\/g, '/')}/${safeName}`
}
