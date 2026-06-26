import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'matching-games')
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const pairInclude = {
  pairs: { orderBy: { sortOrder: 'asc' } },
  _count: { select: { pairs: true } },
}

const gameInclude = {
  stages: {
    orderBy: { sortOrder: 'asc' },
    include: pairInclude,
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

function formatPair(pair) {
  return {
    id: pair.id,
    sortOrder: pair.sortOrder,
    imageA: pair.imageA,
    imageB: pair.imageB,
  }
}

function formatStage(stage) {
  return {
    id: stage.id,
    sortOrder: stage.sortOrder,
    title: stage.title || `مرحله ${stage.sortOrder + 1}`,
    pairCount: stage.pairs?.length ?? stage._count?.pairs ?? 0,
    pairs: (stage.pairs || []).map(formatPair),
  }
}

function formatGame(game) {
  const stages = (game.stages || []).map(formatStage)
  const pairCount = stages.reduce((sum, s) => sum + s.pairCount, 0)
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description,
    isVisible: game.isVisible,
    stageCount: stages.length,
    pairCount,
    stages,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  }
}

async function savePairImage(file, slug, stageOrder, pairOrder, side) {
  if (!file || typeof file === 'string') {
    throw new AppError(400, `تصویر ${side === 'a' ? 'اول' : 'دوم'} الزامی است.`)
  }
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new AppError(400, 'فرمت تصویر مجاز نیست. (JPG, PNG, WEBP)')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new AppError(400, 'حداکثر حجم هر تصویر ۸ مگابایت است.')
  }

  const dir = path.join(UPLOAD_DIR, slug, `stage-${stageOrder + 1}`, `pair-${pairOrder + 1}`)
  await mkdir(dir, { recursive: true })
  const ext = path.extname(file.name) || '.png'
  const safeName = `${side}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, safeName), buffer)
  return `/uploads/matching-games/${slug}/stage-${stageOrder + 1}/pair-${pairOrder + 1}/${safeName}`
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

export async function listMatchingGames({ visibleOnly = false } = {}) {
  const games = await prisma.matchingGame.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { createdAt: 'desc' },
    include: gameInclude,
  })
  return games.map(formatGame)
}

export async function getMatchingGameBySlug(slug, { visibleOnly = false } = {}) {
  const game = await prisma.matchingGame.findUnique({
    where: { slug },
    include: gameInclude,
  })
  if (!game) throw new AppError(404, 'بازی یافت نشد.')
  if (visibleOnly && !game.isVisible) throw new AppError(404, 'بازی یافت نشد.')
  return formatGame(game)
}

export async function getMatchingGameById(id) {
  const game = await prisma.matchingGame.findUnique({
    where: { id: Number(id) },
    include: gameInclude,
  })
  if (!game) throw new AppError(404, 'بازی یافت نشد.')
  return formatGame(game)
}

export async function createMatchingGame({ title, description, slug }) {
  const cleanSlug = normalizeGameSlug(slug)
  if (!title?.trim()) {
    throw new AppError(422, 'عنوان و شناسه بازی الزامی است.')
  }

  try {
    return formatGame(await prisma.matchingGame.create({
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

export async function updateMatchingGame(id, { title, description, isVisible }) {
  const existing = await prisma.matchingGame.findUnique({ where: { id: Number(id) } })
  if (!existing) throw new AppError(404, 'بازی یافت نشد.')

  const data = {}
  if (title !== undefined) data.title = title.trim()
  if (description !== undefined) data.description = description.trim()
  if (isVisible !== undefined) data.isVisible = Boolean(isVisible)

  return formatGame(await prisma.matchingGame.update({
    where: { id: existing.id },
    data,
    include: gameInclude,
  }))
}

export async function deleteMatchingGame(id) {
  const existing = await prisma.matchingGame.findUnique({ where: { id: Number(id) } })
  if (!existing) throw new AppError(404, 'بازی یافت نشد.')
  await prisma.matchingGame.delete({ where: { id: existing.id } })
  await removeGameFiles(existing.slug)
  return { ok: true }
}

export async function createMatchingStage(gameId, { title }) {
  const game = await prisma.matchingGame.findUnique({
    where: { id: Number(gameId) },
    include: { stages: { orderBy: { sortOrder: 'desc' }, take: 1 } },
  })
  if (!game) throw new AppError(404, 'بازی یافت نشد.')

  const sortOrder = game.stages.length ? game.stages[0].sortOrder + 1 : 0
  const stage = await prisma.matchingStage.create({
    data: {
      gameId: game.id,
      sortOrder,
      title: title?.trim() || `مرحله ${sortOrder + 1}`,
    },
    include: pairInclude,
  })

  return formatStage(stage)
}

export async function deleteMatchingStage(stageId) {
  const existing = await prisma.matchingStage.findUnique({
    where: { id: Number(stageId) },
    include: { game: { include: { stages: { orderBy: { sortOrder: 'asc' } } } } },
  })
  if (!existing) throw new AppError(404, 'مرحله یافت نشد.')

  await prisma.matchingStage.delete({ where: { id: existing.id } })

  const remaining = existing.game.stages.filter((s) => s.id !== existing.id)
  await prisma.$transaction(
    remaining.map((stage, index) =>
      prisma.matchingStage.update({
        where: { id: stage.id },
        data: { sortOrder: index },
      }),
    ),
  )

  return { ok: true }
}

export async function createMatchingPair(stageId, { imageA, imageB }) {
  const stage = await prisma.matchingStage.findUnique({
    where: { id: Number(stageId) },
    include: {
      game: true,
      pairs: { orderBy: { sortOrder: 'desc' }, take: 1 },
    },
  })
  if (!stage) throw new AppError(404, 'مرحله یافت نشد.')

  const sortOrder = stage.pairs.length ? stage.pairs[0].sortOrder + 1 : 0
  const urlA = await savePairImage(imageA, stage.game.slug, stage.sortOrder, sortOrder, 'a')
  const urlB = await savePairImage(imageB, stage.game.slug, stage.sortOrder, sortOrder, 'b')

  const pair = await prisma.matchingPair.create({
    data: {
      stageId: stage.id,
      sortOrder,
      imageA: urlA,
      imageB: urlB,
    },
  })

  return formatPair(pair)
}

export async function deleteMatchingPair(pairId) {
  const existing = await prisma.matchingPair.findUnique({
    where: { id: Number(pairId) },
    include: { stage: { include: { pairs: { orderBy: { sortOrder: 'asc' } } } } },
  })
  if (!existing) throw new AppError(404, 'جفت تصویر یافت نشد.')

  await prisma.matchingPair.delete({ where: { id: existing.id } })

  const remaining = existing.stage.pairs.filter((p) => p.id !== existing.id)
  await prisma.$transaction(
    remaining.map((pair, index) =>
      prisma.matchingPair.update({
        where: { id: pair.id },
        data: { sortOrder: index },
      }),
    ),
  )

  return { ok: true }
}
