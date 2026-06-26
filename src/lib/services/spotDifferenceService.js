import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { saveUploadedImage } from '@/lib/uploadImage'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'spot-difference')

const stageInclude = {
  spots: { orderBy: { sortOrder: 'asc' } },
  _count: { select: { spots: true } },
}

const gameInclude = {
  stages: {
    orderBy: { sortOrder: 'asc' },
    include: stageInclude,
  },
}

function normalizeGameSlug(slug) {
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!cleanSlug) {
    throw new AppError(422, 'شناسه بازی باید فقط شامل حروف انگلیسی، عدد و خط تیره باشد.')
  }

  return cleanSlug
}

function formatSpot(spot) {
  return {
    id: spot.id,
    sortOrder: spot.sortOrder,
    centerX: spot.centerX,
    centerY: spot.centerY,
    radius: spot.radius,
  }
}

function formatStage(stage) {
  return {
    id: stage.id,
    sortOrder: stage.sortOrder,
    title: stage.title || `مرحله ${stage.sortOrder + 1}`,
    imageLeft: stage.imageLeft,
    imageRight: stage.imageRight,
    spotCount: stage.spots?.length ?? stage._count?.spots ?? 0,
    spots: (stage.spots || []).map(formatSpot),
  }
}

function formatGame(game) {
  const stages = (game.stages || []).map(formatStage)
  const spotCount = stages.reduce((sum, s) => sum + s.spotCount, 0)
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description,
    isVisible: game.isVisible,
    stageCount: stages.length,
    spotCount,
    stages,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  }
}

async function saveStageImage(file, slug, stageOrder, side) {
  if (!file || typeof file === 'string') {
    throw new AppError(400, `تصویر ${side === 'left' ? 'چپ' : 'راست'} الزامی است.`)
  }

  return saveUploadedImage(file, {
    uploadDir: `uploads/spot-difference/${slug}/stage-${stageOrder + 1}`,
    filename: side,
    maxSize: 8 * 1024 * 1024,
    maxWidth: 1800,
    maxHeight: 1800,
    quality: 86,
  })
}

async function removeGameFiles(slug) {
  const dir = path.join(UPLOAD_DIR, slug)
  try {
    const { rm } = await import('fs/promises')
    await rm(dir, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

export async function listSpotDifferenceGames({ visibleOnly = false } = {}) {
  const games = await prisma.spotDifferenceGame.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { createdAt: 'desc' },
    include: gameInclude,
  })
  return games.map(formatGame)
}

export async function getSpotDifferenceGameBySlug(slug, { visibleOnly = false } = {}) {
  const game = await prisma.spotDifferenceGame.findUnique({
    where: { slug },
    include: gameInclude,
  })
  if (!game) throw new AppError(404, 'بازی یافت نشد.')
  if (visibleOnly && !game.isVisible) throw new AppError(404, 'بازی یافت نشد.')
  return formatGame(game)
}

export async function getSpotDifferenceGameById(id) {
  const game = await prisma.spotDifferenceGame.findUnique({
    where: { id: Number(id) },
    include: gameInclude,
  })
  if (!game) throw new AppError(404, 'بازی یافت نشد.')
  return formatGame(game)
}

export async function getSpotDifferenceStageById(stageId) {
  const stage = await prisma.spotDifferenceStage.findUnique({
    where: { id: Number(stageId) },
    include: {
      game: true,
      ...stageInclude,
    },
  })
  if (!stage) throw new AppError(404, 'مرحله یافت نشد.')
  return {
    ...formatStage(stage),
    gameId: stage.gameId,
    gameTitle: stage.game.title,
    gameSlug: stage.game.slug,
  }
}

export async function createSpotDifferenceGame({ title, description, slug }) {
  const cleanSlug = normalizeGameSlug(slug)
  if (!title?.trim()) {
    throw new AppError(422, 'عنوان و شناسه بازی الزامی است.')
  }

  try {
    return formatGame(await prisma.spotDifferenceGame.create({
      data: {
        slug: cleanSlug,
        title: title.trim(),
        description: description?.trim() || '',
      },
      include: gameInclude,
    }))
  } catch (error) {
    if (error?.code === 'P2002') throw new AppError(422, 'این شناسه بازی قبلاً ثبت شده است.')
    throw error
  }
}

export async function updateSpotDifferenceGame(id, { title, description, isVisible }) {
  const existing = await prisma.spotDifferenceGame.findUnique({ where: { id: Number(id) } })
  if (!existing) throw new AppError(404, 'بازی یافت نشد.')

  const data = {}
  if (title !== undefined) data.title = title.trim()
  if (description !== undefined) data.description = description.trim()
  if (isVisible !== undefined) data.isVisible = Boolean(isVisible)

  return formatGame(await prisma.spotDifferenceGame.update({
    where: { id: existing.id },
    data,
    include: gameInclude,
  }))
}

export async function createSpotDifferenceStage(gameId, { title, imageLeft, imageRight }) {
  const game = await prisma.spotDifferenceGame.findUnique({
    where: { id: Number(gameId) },
    include: { stages: { orderBy: { sortOrder: 'desc' }, take: 1 } },
  })
  if (!game) throw new AppError(404, 'بازی یافت نشد.')

  const sortOrder = game.stages.length ? game.stages[0].sortOrder + 1 : 0
  const leftUrl = await saveStageImage(imageLeft, game.slug, sortOrder, 'left')
  const rightUrl = await saveStageImage(imageRight, game.slug, sortOrder, 'right')

  const stage = await prisma.spotDifferenceStage.create({
    data: {
      gameId: game.id,
      sortOrder,
      title: title?.trim() || `مرحله ${sortOrder + 1}`,
      imageLeft: leftUrl,
      imageRight: rightUrl,
    },
    include: stageInclude,
  })

  return formatStage(stage)
}

export async function updateSpotDifferenceStage(stageId, { title, imageLeft, imageRight }) {
  const existing = await prisma.spotDifferenceStage.findUnique({
    where: { id: Number(stageId) },
    include: { game: true },
  })
  if (!existing) throw new AppError(404, 'مرحله یافت نشد.')

  const data = {}
  if (title !== undefined) data.title = title.trim()
  if (imageLeft && typeof imageLeft !== 'string') {
    data.imageLeft = await saveStageImage(imageLeft, existing.game.slug, existing.sortOrder, 'left')
  }
  if (imageRight && typeof imageRight !== 'string') {
    data.imageRight = await saveStageImage(imageRight, existing.game.slug, existing.sortOrder, 'right')
  }

  return formatStage(await prisma.spotDifferenceStage.update({
    where: { id: existing.id },
    data,
    include: stageInclude,
  }))
}

export async function deleteSpotDifferenceStage(stageId) {
  const existing = await prisma.spotDifferenceStage.findUnique({
    where: { id: Number(stageId) },
    include: { game: { include: { stages: { orderBy: { sortOrder: 'asc' } } } } },
  })
  if (!existing) throw new AppError(404, 'مرحله یافت نشد.')

  await prisma.spotDifferenceStage.delete({ where: { id: existing.id } })

  const remaining = existing.game.stages.filter((s) => s.id !== existing.id)
  await prisma.$transaction(
    remaining.map((stage, index) =>
      prisma.spotDifferenceStage.update({
        where: { id: stage.id },
        data: { sortOrder: index },
      }),
    ),
  )

  return { ok: true }
}

export async function replaceSpotDifferenceSpots(stageId, spots = []) {
  const id = Number(stageId)
  const stage = await prisma.spotDifferenceStage.findUnique({ where: { id } })
  if (!stage) throw new AppError(404, 'مرحله یافت نشد.')

  const normalized = spots.map((spot, index) => ({
    stageId: id,
    sortOrder: index,
    centerX: Number(spot.centerX),
    centerY: Number(spot.centerY),
    radius: Number(spot.radius) || 0.07,
  }))

  for (const spot of normalized) {
    if (
      Number.isNaN(spot.centerX) || Number.isNaN(spot.centerY)
      || spot.centerX < 0 || spot.centerX > 1 || spot.centerY < 0 || spot.centerY > 1
    ) {
      throw new AppError(422, 'مختصات تفاوت‌ها نامعتبر است.')
    }
  }

  await prisma.$transaction([
    prisma.spotDifferenceSpot.deleteMany({ where: { stageId: id } }),
    ...(normalized.length
      ? [prisma.spotDifferenceSpot.createMany({ data: normalized })]
      : []),
  ])

  return getSpotDifferenceStageById(id)
}

export async function deleteSpotDifferenceGame(id) {
  const existing = await prisma.spotDifferenceGame.findUnique({ where: { id: Number(id) } })
  if (!existing) throw new AppError(404, 'بازی یافت نشد.')
  await prisma.spotDifferenceGame.delete({ where: { id: existing.id } })
  await removeGameFiles(existing.slug)
  return { ok: true }
}

export function hitTestSpot(spots, nx, ny, foundIds = new Set()) {
  for (const spot of spots) {
    if (foundIds.has(spot.id)) continue
    const dx = nx - spot.centerX
    const dy = ny - spot.centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= spot.radius) return spot
  }
  return null
}
