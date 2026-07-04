import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'

export async function listAlbums({ onlyVisible = false } = {}) {
  return prisma.memoryAlbum.findMany({
    where: onlyVisible ? { isVisible: true } : {},
    orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }, { id: 'desc' }],
    include: {
      photos: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    },
  })
}

export async function createAlbum(data) {
  const title = String(data.title || '').trim()
  const year = String(data.year || '').trim()
  if (!title) throw new AppError(422, 'عنوان آلبوم الزامی است.')
  if (!year) throw new AppError(422, 'سال آلبوم الزامی است.')
  const max = await prisma.memoryAlbum.aggregate({ _max: { sortOrder: true } })
  return prisma.memoryAlbum.create({
    data: {
      title,
      year,
      coverUrl: data.coverUrl?.trim() || null,
      isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : true,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  })
}

export async function updateAlbum(id, data) {
  const patch = {}
  if (data.title !== undefined) {
    const title = String(data.title || '').trim()
    if (!title) throw new AppError(422, 'عنوان آلبوم الزامی است.')
    patch.title = title
  }
  if (data.year !== undefined) {
    const year = String(data.year || '').trim()
    if (!year) throw new AppError(422, 'سال آلبوم الزامی است.')
    patch.year = year
  }
  if (data.coverUrl !== undefined) patch.coverUrl = data.coverUrl?.trim() || null
  if (data.isVisible !== undefined) patch.isVisible = Boolean(data.isVisible)
  if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder) || 0
  if (!Object.keys(patch).length) throw new AppError(422, 'فیلدی برای ویرایش ارسال نشده.')
  return prisma.memoryAlbum.update({ where: { id }, data: patch })
}

export async function deleteAlbum(id) {
  const album = await prisma.memoryAlbum.findUnique({ where: { id } })
  if (!album) throw new AppError(404, 'آلبوم یافت نشد.')
  await prisma.memoryAlbum.delete({ where: { id } }) // عکس‌ها با Cascade حذف می‌شوند
  return { ok: true }
}

export async function addPhoto(albumId, data) {
  const album = await prisma.memoryAlbum.findUnique({ where: { id: albumId } })
  if (!album) throw new AppError(404, 'آلبوم یافت نشد.')
  const imageUrl = String(data.imageUrl || '').trim()
  if (!imageUrl) throw new AppError(422, 'تصویر الزامی است.')
  const max = await prisma.memoryPhoto.aggregate({
    where: { albumId },
    _max: { sortOrder: true },
  })
  return prisma.memoryPhoto.create({
    data: {
      albumId,
      imageUrl,
      caption: data.caption?.trim() || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  })
}

export async function updatePhoto(photoId, data) {
  const photo = await prisma.memoryPhoto.findUnique({ where: { id: photoId } })
  if (!photo) throw new AppError(404, 'عکس یافت نشد.')
  const patch = {}
  if (data.caption !== undefined) patch.caption = String(data.caption || '').trim() || null
  if (!Object.keys(patch).length) throw new AppError(422, 'فیلدی برای ویرایش ارسال نشده.')
  return prisma.memoryPhoto.update({ where: { id: photoId }, data: patch })
}

export async function deletePhoto(photoId) {
  const photo = await prisma.memoryPhoto.findUnique({ where: { id: photoId } })
  if (!photo) throw new AppError(404, 'عکس یافت نشد.')
  await prisma.memoryPhoto.delete({ where: { id: photoId } })
  return { ok: true }
}
