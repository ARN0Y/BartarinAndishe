import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { randomUUID } from 'crypto'
import { AppError } from '@/lib/errors'

const execFileAsync = promisify(execFile)

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public')
const VIDEO_DIR = path.join(PUBLIC_ROOT, 'uploads', 'videos')
const TMP_DIR = path.join(VIDEO_DIR, '.tmp')

const ALLOWED_MIME = new Set([
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
  'video/x-msvideo', 'video/3gpp', 'video/ogg', 'video/mpeg',
])
const ALLOWED_EXT = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi', '.3gp', '.ogv', '.m4v', '.mpeg', '.mpg'])
const MAX_INPUT = 120 * 1024 * 1024 // 120MB خام

function safeBase(name) {
  return (String(name || 'clip').replace(/\.[^.]+$/, '') || 'clip')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'clip'
}

/**
 * ذخیرهٔ ویدیوی آپلودی با فشرده‌سازی و بهینه‌سازی خودکار (ffmpeg → MP4 H.264).
 * خروجی: نشانی نسبی مثل /uploads/videos/clip-....mp4
 */
export async function saveOptimizedVideo(file, { filename } = {}) {
  if (!file || typeof file === 'string' || !(file.size > 0)) {
    throw new AppError(422, 'فایل ویدیو ارسال نشده.')
  }

  const mime = file.type?.toLowerCase?.() || ''
  const ext = path.extname(file.name || '').toLowerCase()
  if ((mime && !ALLOWED_MIME.has(mime)) && !ALLOWED_EXT.has(ext)) {
    throw new AppError(422, 'فرمت ویدیو پشتیبانی نمی‌شود. (mp4, webm, mov, mkv و ...)')
  }
  if (file.size > MAX_INPUT) {
    throw new AppError(422, `حجم ویدیو نباید بیشتر از ${Math.floor(MAX_INPUT / 1024 / 1024)} مگابایت باشد. لطفاً ویدیوی کوتاه‌تری بارگذاری کنید.`)
  }

  await mkdir(TMP_DIR, { recursive: true })
  const uid = randomUUID().slice(0, 8)
  const rawPath = path.join(TMP_DIR, `raw-${Date.now()}-${uid}`)
  const outName = `${safeBase(filename || file.name)}-${Date.now()}-${uid}.mp4`
  const outPath = path.join(VIDEO_DIR, outName)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(rawPath, buffer)

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-y', '-i', rawPath,
        // مقیاس حداکثر عرض ۱۲۸۰، ابعاد زوج
        '-vf', "scale='min(1280,iw)':-2",
        '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-crf', '28', '-preset', 'veryfast',
        '-c:a', 'aac', '-b:a', '96k',
        '-movflags', '+faststart',
        outPath,
      ],
      { timeout: 1000 * 60 * 12, maxBuffer: 1024 * 1024 * 32 },
    )
  } catch {
    await unlink(rawPath).catch(() => {})
    await unlink(outPath).catch(() => {})
    throw new AppError(500, 'پردازش ویدیو ناموفق بود؛ لطفاً فایل دیگری (mp4) یا ویدیوی کوتاه‌تر امتحان کنید.')
  }

  await unlink(rawPath).catch(() => {})
  return `/uploads/videos/${outName}`
}
