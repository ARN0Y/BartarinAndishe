import { prisma } from '@/lib/prisma'
import { DEFAULT_CONTRACT_ARTICLES } from '@/data/tuitionContractArticles'

// کلید جدید برای «مجموعهٔ کامل مواد قابل‌ویرایش» (جدا از کلید قدیمی contractCustomArticles)
export const CONTRACT_ARTICLES_KEY = 'contractArticles'

function normalizeArticles(data) {
  if (!Array.isArray(data)) return []
  return data
    .map((a) => ({
      title: String(a?.title || '').trim(),
      numbered: Boolean(a?.numbered),
      clauses: Array.isArray(a?.clauses)
        ? a.clauses.map((c) => String(c || '').trim()).filter(Boolean)
        : [],
    }))
    .filter((a) => a.title || a.clauses.length)
}

export function getContractArticleDefaults() {
  return DEFAULT_CONTRACT_ARTICLES.map((a) => ({ ...a, clauses: [...a.clauses] }))
}

/** مواد قرارداد — override مدیر در صورت وجود، وگرنه پیش‌فرض‌های استاندارد (۵ ماده) */
export async function getContractArticles() {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: CONTRACT_ARTICLES_KEY } })
    if (row?.value) {
      const parsed = normalizeArticles(JSON.parse(row.value))
      if (parsed.length) return parsed
    }
  } catch { /* از پیش‌فرض استفاده می‌شود */ }
  return getContractArticleDefaults()
}

export async function saveContractArticles(articles) {
  const clean = normalizeArticles(articles)
  await prisma.appSetting.upsert({
    where: { key: CONTRACT_ARTICLES_KEY },
    create: { key: CONTRACT_ARTICLES_KEY, value: JSON.stringify(clean) },
    update: { value: JSON.stringify(clean) },
  })
  return clean
}
