import { AppError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'
import {
  GRADE_DEFINITIONS,
  mergeWithGradeDefinitions,
  validateGradeRanges,
  hasCompleteGradeRanges,
} from '@/lib/gradeLevel'

export async function getGradeRangesForYear(academicYear) {
  const year = normalizeAcademicYear(academicYear)
  const rows = await prisma.gradeBirthRange.findMany({
    where: { academicYear: year },
    orderBy: { sortOrder: 'asc' },
  })
  return mergeWithGradeDefinitions(rows)
}

export async function saveGradeRangesForYear(academicYear, ranges) {
  const year = normalizeAcademicYear(academicYear)
  const merged = mergeWithGradeDefinitions(ranges)
  const errors = validateGradeRanges(merged)
  if (errors.length) {
    throw new AppError(422, errors[0])
  }

  await prisma.$transaction([
    ...GRADE_DEFINITIONS.map((def) => {
      const row = merged.find((r) => r.gradeKey === def.gradeKey)
      return prisma.gradeBirthRange.upsert({
        where: { academicYear_gradeKey: { academicYear: year, gradeKey: def.gradeKey } },
        create: {
          academicYear: year,
          gradeKey: def.gradeKey,
          gradeLabel: def.gradeLabel,
          birthFrom: row.birthFrom,
          birthTo: row.birthTo,
          sortOrder: def.sortOrder,
        },
        update: {
          gradeLabel: def.gradeLabel,
          birthFrom: row.birthFrom,
          birthTo: row.birthTo,
        },
      })
    }),
    prisma.gradeBirthRange.deleteMany({ where: { academicYear: year, gradeKey: 'grade1' } }),
  ])

  return getGradeRangesForYear(year)
}

export async function gradeRangesConfiguredForYear(academicYear) {
  const ranges = await getGradeRangesForYear(academicYear)
  return hasCompleteGradeRanges(ranges)
}

export async function deleteGradeRangesForYear(academicYear) {
  const year = normalizeAcademicYear(academicYear)
  await prisma.gradeBirthRange.deleteMany({ where: { academicYear: year } })
}
