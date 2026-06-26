import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
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
const DEFAULT_MAX_INPUT_PIXELS = 36_000_000

function assertInsidePublic(targetPath) {
  const resolved = path.resolve(targetPath)
  if (resolved !== PUBLIC_ROOT && !resolved.startsWith(`${PUBLIC_ROOT}${path.sep}`)) {
    throw new AppError(400, 'مسیر آپلود نامعتبر است.')
  }
  return resolved
}

function normalizeExt(ext) {
  const clean = String(ext || '').toLowerCase()
  return clean === 'jpeg' ? 'jpg' : clean
}

function safeFilename(filename, ext, { forceExt = false } = {}) {
  const parsed = path.parse(path.basename(String(filename || 'image')))
  const base = (parsed.name || 'image')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'image'
  const requestedExt = normalizeExt((parsed.ext || `.${ext}`).slice(1))
  const finalExt = !forceExt && ALLOWED_EXTENSIONS.has(requestedExt) ? requestedExt : ext
  return `${base}.${finalExt}`
}

function detectImageExt(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg'
  }

  if (
    buffer.length >= 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
    && buffer[4] === 0x0d
    && buffer[5] === 0x0a
    && buffer[6] === 0x1a
    && buffer[7] === 0x0a
  ) {
    return 'png'
  }

  if (
    buffer.length >= 12
    && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}

function ensureExtensionMatches({ requestedExt, detectedExt, mimeType }) {
  const expectedMimeExt = normalizeExt(MIME_EXTENSIONS[mimeType])
  if (expectedMimeExt && expectedMimeExt !== detectedExt) {
    throw new AppError(422, 'محتوای فایل با نوع تصویر ارسالی سازگار نیست.')
  }

  if (requestedExt && requestedExt !== detectedExt) {
    throw new AppError(422, 'پسوند فایل با محتوای تصویر سازگار نیست.')
  }
}

async function optimizeImageBuffer(
  buffer,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 82,
    maxInputPixels = DEFAULT_MAX_INPUT_PIXELS,
  } = {},
) {
  const image = sharp(buffer, {
    failOn: 'error',
    limitInputPixels: maxInputPixels,
  }).rotate()

  const metadata = await image.metadata()
  if (!metadata.width || !metadata.height) {
    throw new AppError(422, 'تصویر ارسالی قابل پردازش نیست.')
  }

  const optimized = await image
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 5,
      smartSubsample: true,
    })
    .toBuffer()

  return {
    buffer: optimized,
    ext: 'webp',
  }
}

export async function saveUploadedImage(
  file,
  {
    uploadDir,
    filename,
    maxSize = 3 * 1024 * 1024,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 82,
    optimize = true,
  },
) {
  if (!file || typeof file === 'string') {
    throw new AppError(422, 'فایل تصویر ارسال نشده.')
  }

  const mimeType = file.type?.toLowerCase?.() || ''
  const requestedExt = normalizeExt(path.extname(file.name || '').slice(1))
  const fallbackExt = normalizeExt(MIME_EXTENSIONS[mimeType]) || 'jpg'
  const ext = requestedExt || fallbackExt
  if (!ALLOWED_EXTENSIONS.has(ext) || (mimeType && !ALLOWED_MIME_TYPES.has(mimeType))) {
    throw new AppError(422, 'فرمت تصویر باید jpg، png یا webp باشد.')
  }

  if (file.size > maxSize) {
    throw new AppError(422, `حجم عکس نباید بیشتر از ${Math.ceil(maxSize / 1024 / 1024)} مگابایت باشد.`)
  }

  const dir = assertInsidePublic(path.join(PUBLIC_ROOT, uploadDir))
  await mkdir(dir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const detectedExt = detectImageExt(buffer)
  if (!detectedExt) {
    throw new AppError(422, 'محتوای فایل با فرمت تصویر ارسالی سازگار نیست.')
  }
  ensureExtensionMatches({ requestedExt, detectedExt, mimeType })

  const output = optimize
    ? await optimizeImageBuffer(buffer, { maxWidth, maxHeight, quality })
    : { buffer, ext: detectedExt }

  const safeName = safeFilename(filename, output.ext, { forceExt: optimize })
  await writeFile(assertInsidePublic(path.join(dir, safeName)), output.buffer)

  return `/${uploadDir.replace(/\\/g, '/')}/${safeName}`
}
