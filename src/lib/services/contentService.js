import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'

export const CONTENT_SECTIONS = new Set(['parentResource', 'extraSkill'])

function assertSection(section) {
  if (!CONTENT_SECTIONS.has(section)) throw new AppError(422, 'بخش محتوای نامعتبر است.')
}

export async function listContentBlocks(section, { onlyVisible = false } = {}) {
  assertSection(section)
  return prisma.contentBlock.findMany({
    where: { section, ...(onlyVisible ? { isVisible: true } : {}) },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  })
}

export async function createContentBlock(section, data) {
  assertSection(section)
  const title = String(data.title || '').trim()
  if (!title) throw new AppError(422, 'عنوان الزامی است.')
  const max = await prisma.contentBlock.aggregate({
    where: { section },
    _max: { sortOrder: true },
  })
  return prisma.contentBlock.create({
    data: {
      section,
      title,
      body: data.body?.trim() || null,
      mediaUrl: data.mediaUrl?.trim() || null,
      mediaType: data.mediaType?.trim() || null,
      linkUrl: data.linkUrl?.trim() || null,
      isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : true,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  })
}

export async function updateContentBlock(id, data) {
  const patch = {}
  if (data.title !== undefined) {
    const title = String(data.title || '').trim()
    if (!title) throw new AppError(422, 'عنوان الزامی است.')
    patch.title = title
  }
  if (data.body !== undefined) patch.body = data.body?.trim() || null
  if (data.mediaUrl !== undefined) patch.mediaUrl = data.mediaUrl?.trim() || null
  if (data.mediaType !== undefined) patch.mediaType = data.mediaType?.trim() || null
  if (data.linkUrl !== undefined) patch.linkUrl = data.linkUrl?.trim() || null
  if (data.isVisible !== undefined) patch.isVisible = Boolean(data.isVisible)
  if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder) || 0
  if (!Object.keys(patch).length) throw new AppError(422, 'فیلدی برای ویرایش ارسال نشده.')
  return prisma.contentBlock.update({ where: { id }, data: patch })
}

export async function deleteContentBlock(id) {
  const block = await prisma.contentBlock.findUnique({ where: { id } })
  if (!block) throw new AppError(404, 'محتوا یافت نشد.')
  await prisma.contentBlock.delete({ where: { id } })
  return { ok: true }
}
