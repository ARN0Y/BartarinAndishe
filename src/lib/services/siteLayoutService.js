import { prisma } from '@/lib/prisma'
import { navItems } from '@/data/navItems'
import { contentGallerySections } from '@/data/contentGalleries'

export const SITE_LAYOUT_KEY = 'siteLayout'

// گالری‌های قابل‌ویرایش (تصاویر + برچسب‌ها) — ترتیب همان ترتیب نمایش در صفحه
export const GALLERY_IDS = ['edu-activities', 'multiple-intelligence', 'celebrations', 'extra-skills']

const HEADER_DEFAULT = {
  brandTop: 'کودکستان',
  brandMain: 'برترین اندیشه',
  logoUrl: '/images/logo.svg',
}

function readOverride(raw) {
  if (!raw) return {}
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function defaultGalleries() {
  const out = {}
  for (const section of contentGallerySections) {
    out[section.id] = {
      badge: section.badge || '',
      title: section.title || '',
      subtitle: section.subtitle || '',
      strip: (section.strip || []).map((item) => ({ ...item })),
    }
  }
  // اطمینان از وجود هر سه گالری حتی اگر در data نباشند
  for (const id of GALLERY_IDS) {
    if (!out[id]) out[id] = { badge: '', title: '', subtitle: '', strip: [] }
  }
  return out
}

export function getSiteLayoutDefaults() {
  return {
    header: { ...HEADER_DEFAULT },
    nav: Object.fromEntries(navItems.map((n) => [n.id, n.label])),
    galleries: defaultGalleries(),
  }
}

export async function getSiteLayoutOverride() {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: SITE_LAYOUT_KEY } })
    return readOverride(row?.value)
  } catch {
    return {}
  }
}

/** چیدمان نهایی برای رندر عمومی — پیش‌فرض‌ها با override ادغام شده */
export async function getMergedSiteLayout() {
  const defaults = getSiteLayoutDefaults()
  const ov = await getSiteLayoutOverride()

  const header = { ...defaults.header, ...(ov.header || {}) }
  // مقدار خالی نباید پیش‌فرض را پاک کند
  for (const key of Object.keys(defaults.header)) {
    if (!header[key] || !String(header[key]).trim()) header[key] = defaults.header[key]
  }

  const nav = { ...defaults.nav }
  if (ov.nav && typeof ov.nav === 'object') {
    for (const [id, label] of Object.entries(ov.nav)) {
      if (typeof label === 'string' && label.trim()) nav[id] = label.trim()
    }
  }

  const galleries = {}
  for (const id of GALLERY_IDS) {
    const d = defaults.galleries[id]
    const o = ov.galleries?.[id]
    if (!o) {
      galleries[id] = d
      continue
    }
    galleries[id] = {
      badge: (o.badge ?? d.badge) || '',
      title: (o.title ?? d.title) || '',
      subtitle: (o.subtitle ?? d.subtitle) || '',
      strip: Array.isArray(o.strip) ? o.strip : d.strip,
    }
  }

  return { header, nav, galleries }
}

/** برای ادیتور پنل: هم پیش‌فرض‌ها هم مقدار فعلی */
export async function getSiteLayoutForAdmin() {
  return {
    defaults: getSiteLayoutDefaults(),
    current: await getMergedSiteLayout(),
    navOrder: navItems.map((n) => ({ id: n.id, cms: n.cms || null })),
  }
}

export async function saveSiteLayout(payload = {}) {
  const clean = {}

  if (payload.header && typeof payload.header === 'object') {
    clean.header = {
      brandTop: String(payload.header.brandTop || '').trim(),
      brandMain: String(payload.header.brandMain || '').trim(),
      logoUrl: String(payload.header.logoUrl || '').trim(),
    }
  }

  if (payload.nav && typeof payload.nav === 'object') {
    clean.nav = {}
    for (const [id, label] of Object.entries(payload.nav)) {
      clean.nav[id] = String(label || '').trim()
    }
  }

  if (payload.galleries && typeof payload.galleries === 'object') {
    clean.galleries = {}
    for (const id of GALLERY_IDS) {
      const g = payload.galleries[id]
      if (!g || typeof g !== 'object') continue
      clean.galleries[id] = {
        badge: String(g.badge || '').trim(),
        title: String(g.title || '').trim(),
        subtitle: String(g.subtitle || '').trim(),
        strip: Array.isArray(g.strip)
          ? g.strip
              .map((it, i) => {
                const type = it?.type === 'video' ? 'video' : 'image'
                const entry = {
                  id: String(it?.id || `${id}-${i}`),
                  type,
                  src: String(it?.src || '').trim(),
                  caption: String(it?.caption || '').trim(),
                }
                if (type === 'video' && it?.poster) entry.poster = String(it.poster).trim()
                return entry
              })
              .filter((it) => it.src)
          : [],
      }
    }
  }

  await prisma.appSetting.upsert({
    where: { key: SITE_LAYOUT_KEY },
    create: { key: SITE_LAYOUT_KEY, value: JSON.stringify(clean) },
    update: { value: JSON.stringify(clean) },
  })

  return getMergedSiteLayout()
}
