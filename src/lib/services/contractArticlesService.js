import { prisma } from '@/lib/prisma'

export const CONTRACT_ARTICLES_KEY = 'contractCustomArticles'

/** آرایه‌ای از مواد قابل‌ویرایش قرارداد — هر ماده: { title, clauses: string[] } */
export async function getContractArticles() {
  const row = await prisma.appSetting.findUnique({ where: { key: CONTRACT_ARTICLES_KEY } })
  if (!row?.value) return []
  try {
    const data = JSON.parse(row.value)
    if (!Array.isArray(data)) return []
    return data
      .map((a) => ({
        title: String(a?.title || '').trim(),
        clauses: Array.isArray(a?.clauses) ? a.clauses.map((c) => String(c || '').trim()).filter(Boolean) : [],
      }))
      .filter((a) => a.title || a.clauses.length)
  } catch {
    return []
  }
}

export async function saveContractArticles(articles) {
  const clean = Array.isArray(articles)
    ? articles
        .map((a) => ({
          title: String(a?.title || '').trim(),
          clauses: Array.isArray(a?.clauses) ? a.clauses.map((c) => String(c || '').trim()).filter(Boolean) : [],
        }))
        .filter((a) => a.title || a.clauses.length)
    : []
  await prisma.appSetting.upsert({
    where: { key: CONTRACT_ARTICLES_KEY },
    create: { key: CONTRACT_ARTICLES_KEY, value: JSON.stringify(clean) },
    update: { value: JSON.stringify(clean) },
  })
  return clean
}
