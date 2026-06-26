export function studentCodeKey(code) {
  return String(code || '').trim().toLowerCase()
}

export function studentCodesMatch(a, b) {
  const left = studentCodeKey(a)
  const right = studentCodeKey(b)
  return left !== '' && left === right
}

export function formatStudentCodeConflictMessage(inputCode, existing) {
  const trimmed = String(inputCode || '').trim()
  const stored = existing?.studentCode?.trim()
  const name = [existing?.firstName, existing?.lastName].filter(Boolean).join(' ')

  if (stored && stored !== trimmed) {
    return `کد نوآموز «${trimmed}» با «${stored}» یکسان است و قبلاً برای «${name}» ثبت شده است.`
  }
  return `کد نوآموز «${trimmed}» قبلاً برای «${name}» ثبت شده است.`
}

export async function findDuplicateStudentCode(
  prisma,
  { code, academicYear, excludeStudentId = null },
) {
  const trimmed = String(code || '').trim()
  if (!trimmed) return null

  const key = studentCodeKey(trimmed)
  const candidates = await prisma.student.findMany({
    where: {
      academicYear,
      studentCode: { not: null },
      ...(excludeStudentId != null ? { NOT: { id: excludeStudentId } } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true,
      nationalId: true,
    },
  })

  return candidates.find((student) => studentCodeKey(student.studentCode) === key) || null
}
