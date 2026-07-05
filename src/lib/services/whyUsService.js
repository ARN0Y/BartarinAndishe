import { prisma } from '@/lib/prisma'
import { WHY_US_TOPICS, WHY_US_TOPIC_IDS } from '@/data/whyUsTopics'

export const WHY_US_KEY = 'whyUs'

function readOverride(raw) {
  if (!raw) return {}
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function cloneTopic(t) {
  return { ...t, media: (t.media || []).map((m) => ({ ...m })) }
}

export function getWhyUsDefaults() {
  return WHY_US_TOPICS.map(cloneTopic)
}

export async function getWhyUsOverride() {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: WHY_US_KEY } })
    return readOverride(row?.value)
  } catch {
    return {}
  }
}

/** پنج موضوع نهایی (پیش‌فرض + override) برای رندر عمومی و ادیتور */
export async function getMergedWhyUsTopics() {
  const ov = await getWhyUsOverride()
  return getWhyUsDefaults().map((t) => {
    const o = ov[t.id]
    if (!o) return t
    return {
      ...t,
      title: (typeof o.title === 'string' && o.title.trim()) ? o.title : t.title,
      body: typeof o.body === 'string' ? o.body : t.body,
      media: Array.isArray(o.media) ? o.media : t.media,
    }
  })
}

export async function getWhyUsTopicBySlug(slug) {
  const topics = await getMergedWhyUsTopics()
  return topics.find((t) => t.slug === slug) || null
}

export async function getWhyUsForAdmin() {
  return { topics: await getMergedWhyUsTopics() }
}

export async function saveWhyUs(topics) {
  const validIds = new Set(WHY_US_TOPIC_IDS)
  const clean = {}
  for (const t of Array.isArray(topics) ? topics : []) {
    if (!t || !validIds.has(t.id)) continue
    clean[t.id] = {
      title: String(t.title || '').trim(),
      body: String(t.body || '').trim(),
      media: Array.isArray(t.media)
        ? t.media
            .map((m, i) => {
              const type = m?.type === 'video' ? 'video' : 'image'
              const entry = {
                id: String(m?.id || `${t.id}-${i}`),
                type,
                src: String(m?.src || '').trim(),
                caption: String(m?.caption || '').trim(),
              }
              if (type === 'video' && m?.poster) entry.poster = String(m.poster).trim()
              return entry
            })
            .filter((m) => m.src)
        : [],
    }
  }
  await prisma.appSetting.upsert({
    where: { key: WHY_US_KEY },
    create: { key: WHY_US_KEY, value: JSON.stringify(clean) },
    update: { value: JSON.stringify(clean) },
  })
  return getMergedWhyUsTopics()
}
