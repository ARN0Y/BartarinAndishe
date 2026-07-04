import { prisma } from '@/lib/prisma'
import { managerInfo, founderInfo } from '@/data/homeSections'

export const HOME_CONTENT_KEY = 'homeContent'

// فیلدهای متنی قابل‌ویرایش (ترتیب = ترتیب نمایش در ادیتور)
// image: عکس (آپلود) | yearsExperience: خالی = محاسبهٔ خودکار سابقه
const TEXT_FIELDS = {
  manager: ['image', 'fullName', 'honorific', 'role', 'yearsExperience', 'shortIntro', 'philosophy', 'workingHours', 'phone', 'instagram'],
  founder: ['image', 'fullName', 'honorific', 'role', 'yearsExperience', 'shortIntro', 'quote', 'messageTitle', 'messageShort', 'phone', 'instagram'],
}
// فیلدهای فهرستی (آرایه‌ای از رشته) قابل‌ویرایش — با افزودن/حذف
const LIST_FIELDS = {
  manager: ['education', 'responsibilities'],
  founder: ['education', 'highlights'],
}

function readOverrides(raw) {
  if (!raw) return { manager: {}, founder: {} }
  try {
    const data = JSON.parse(raw)
    return { manager: data.manager || {}, founder: data.founder || {} }
  } catch {
    return { manager: {}, founder: {} }
  }
}

export async function getHomeContentOverrides() {
  const row = await prisma.appSetting.findUnique({ where: { key: HOME_CONTENT_KEY } })
  return readOverrides(row?.value)
}

function mergePerson(base, override = {}) {
  const merged = { ...base }
  for (const field of [...TEXT_FIELDS[base.id === 'manager' ? 'manager' : 'founder']]) {
    if (typeof override[field] === 'string' && override[field].trim() !== '') {
      merged[field] = override[field]
    }
  }
  for (const field of [...LIST_FIELDS[base.id === 'manager' ? 'manager' : 'founder']]) {
    if (Array.isArray(override[field])) {
      const cleaned = override[field].map((s) => String(s || '').trim()).filter(Boolean)
      if (cleaned.length) merged[field] = cleaned
    }
  }
  return merged
}

/** اطلاعات مدیر و مؤسس با اعمال ویرایش‌های پنل روی مقادیر پیش‌فرض */
export async function getMergedHomeContent() {
  const overrides = await getHomeContentOverrides()
  return {
    manager: mergePerson(managerInfo, overrides.manager),
    founder: mergePerson(founderInfo, overrides.founder),
  }
}

/** مقادیر پیش‌فرض ویرایش‌پذیر برای فرم پنل */
export function getEditableDefaults() {
  const pick = (info, who) => {
    const out = {}
    for (const f of TEXT_FIELDS[who]) out[f] = info[f] ?? ''
    for (const f of LIST_FIELDS[who]) out[f] = Array.isArray(info[f]) ? info[f] : []
    return out
  }
  return { manager: pick(managerInfo, 'manager'), founder: pick(founderInfo, 'founder') }
}

export async function saveHomeContent(payload = {}) {
  const next = { manager: {}, founder: {} }
  for (const who of ['manager', 'founder']) {
    const src = payload[who] || {}
    for (const f of TEXT_FIELDS[who]) {
      if (src[f] !== undefined) next[who][f] = String(src[f] || '').trim()
    }
    for (const f of LIST_FIELDS[who]) {
      if (Array.isArray(src[f])) {
        next[who][f] = src[f].map((s) => String(s || '').trim()).filter(Boolean)
      }
    }
  }
  await prisma.appSetting.upsert({
    where: { key: HOME_CONTENT_KEY },
    create: { key: HOME_CONTENT_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  })
  return next
}
