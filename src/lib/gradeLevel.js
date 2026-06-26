import { toEnglishDigits } from '@/lib/digits'

export const UNKNOWN_GRADE_LABEL = 'نامشخص'

export const GRADE_DEFINITIONS = [
  { gradeKey: 'prek1', gradeLabel: 'پیش‌دبستانی ۱', sortOrder: 1 },
  { gradeKey: 'prek2', gradeLabel: 'پیش‌دبستانی ۲', sortOrder: 2 },
  { gradeKey: 'prek2_repeat', gradeLabel: 'تکرار پیش‌دبستانی ۲', sortOrder: 3 },
]

export function jalaliToComparable(str) {
  if (!str?.trim()) return null
  const parts = toEnglishDigits(str).trim().split('/')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map((p) => Number(p))
  if (!y || y < 1300 || y > 1500 || !m || m < 1 || m > 12 || !d || d < 1 || d > 31) return null
  return y * 10000 + m * 100 + d
}

export function formatJalaliComparable(n) {
  if (!n) return ''
  const y = Math.floor(n / 10000)
  const m = Math.floor((n % 10000) / 100)
  const d = n % 100
  return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`
}

export function isCompleteJalali(str) {
  return jalaliToComparable(str) !== null
}

/** @returns {{ gradeKey, gradeLabel, birthFrom, birthTo } | null} */
export function resolveGradeFromBirthDate(birthDate, ranges) {
  const bd = jalaliToComparable(birthDate)
  if (!bd || !ranges?.length) return null

  for (const range of ranges) {
    const from = jalaliToComparable(range.birthFrom)
    const to = jalaliToComparable(range.birthTo)
    if (from && to && bd >= from && bd <= to) {
      return range
    }
  }
  return null
}

/** پایه ذخیره‌شده یا محاسبه‌شده؛ در صورت تاریخ کامل بدون تطابق → نامشخص */
export function resolveGradeLabel(birthDate, ranges, storedGradeLevel = null) {
  if (storedGradeLevel?.trim()) return storedGradeLevel.trim()
  if (!isCompleteJalali(birthDate)) return null
  const grade = resolveGradeFromBirthDate(birthDate, ranges)
  return grade?.gradeLabel || UNKNOWN_GRADE_LABEL
}

export function resolveGradeFields(birthDate, ranges) {
  if (!isCompleteJalali(birthDate)) {
    return { gradeKey: null, gradeLevel: null }
  }
  const grade = resolveGradeFromBirthDate(birthDate, ranges)
  if (grade) {
    return { gradeKey: grade.gradeKey, gradeLevel: grade.gradeLabel }
  }
  return { gradeKey: 'unknown', gradeLevel: UNKNOWN_GRADE_LABEL }
}

export function validateGradeRanges(ranges) {
  const errors = []

  for (const def of GRADE_DEFINITIONS) {
    const row = ranges.find((r) => r.gradeKey === def.gradeKey)
    if (!row?.birthFrom || !row?.birthTo) {
      errors.push(`بازه تاریخ تولد «${def.gradeLabel}» کامل نیست.`)
      continue
    }
    const from = jalaliToComparable(row.birthFrom)
    const to = jalaliToComparable(row.birthTo)
    if (!from || !to) {
      errors.push(`تاریخ «${def.gradeLabel}» نامعتبر است.`)
      continue
    }
    if (from > to) {
      errors.push(`در «${def.gradeLabel}» تاریخ شروع باید قبل از تاریخ پایان باشد.`)
    }
  }

  const complete = ranges.filter((r) => jalaliToComparable(r.birthFrom) && jalaliToComparable(r.birthTo))
  for (let i = 0; i < complete.length; i++) {
    for (let j = i + 1; j < complete.length; j++) {
      const a = complete[i]
      const b = complete[j]
      const aFrom = jalaliToComparable(a.birthFrom)
      const aTo = jalaliToComparable(a.birthTo)
      const bFrom = jalaliToComparable(b.birthFrom)
      const bTo = jalaliToComparable(b.birthTo)
      if (aFrom <= bTo && bFrom <= aTo) {
        errors.push(`بازه «${a.gradeLabel}» و «${b.gradeLabel}» هم‌پوشانی دارند.`)
      }
    }
  }

  return errors
}

export function mergeWithGradeDefinitions(rows = []) {
  return GRADE_DEFINITIONS.map((def) => {
    const existing =
      rows.find((r) => r.gradeKey === def.gradeKey)
      || (def.gradeKey === 'prek2_repeat' ? rows.find((r) => r.gradeKey === 'grade1') : null)
    return {
      gradeKey: def.gradeKey,
      gradeLabel: def.gradeLabel,
      birthFrom: existing?.birthFrom || '',
      birthTo: existing?.birthTo || '',
      sortOrder: def.sortOrder,
    }
  })
}

export function hasCompleteGradeRanges(ranges) {
  return validateGradeRanges(mergeWithGradeDefinitions(ranges)).length === 0
}
