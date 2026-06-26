import { studentCodeKey } from '@/lib/studentCode'

const collator = new Intl.Collator('fa', { sensitivity: 'base', numeric: true })

export const STUDENT_SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین ثبت‌نام' },
  { value: 'lastName', label: 'نام خانوادگی' },
  { value: 'studentCode', label: 'کد یکتا' },
  { value: 'gender', label: 'جنسیت' },
  { value: 'genderThenCode', label: 'جنسیت + کد یکتا' },
]

function compareText(a, b) {
  return collator.compare(String(a || ''), String(b || ''))
}

function compareStudentCode(a, b) {
  return compareText(studentCodeKey(a), studentCodeKey(b))
}

export function compareStudentRows(a, b, sortBy, sortDir = 'asc') {
  let cmp = 0

  switch (sortBy) {
    case 'newest':
      cmp = new Date(b.confirmedAt || b.createdAt || 0).getTime()
        - new Date(a.confirmedAt || a.createdAt || 0).getTime()
      break
    case 'lastName':
      cmp = compareText(a.lastName, b.lastName)
      if (cmp === 0) cmp = compareText(a.firstName, b.firstName)
      break
    case 'studentCode':
      cmp = compareStudentCode(a.studentCode, b.studentCode)
      break
    case 'gender':
      cmp = compareText(a.gender, b.gender)
      if (cmp === 0) cmp = compareText(a.lastName, b.lastName)
      break
    case 'genderThenCode':
      cmp = compareText(a.gender, b.gender)
      if (cmp === 0) cmp = compareStudentCode(a.studentCode, b.studentCode)
      if (cmp === 0) cmp = compareText(a.lastName, b.lastName)
      break
    default:
      cmp = 0
  }

  if (sortBy === 'newest') return cmp
  return sortDir === 'desc' ? -cmp : cmp
}

export function sortStudentRows(rows, sortBy = 'newest', sortDir = 'asc') {
  return [...rows].sort((a, b) => compareStudentRows(a, b, sortBy, sortDir))
}

export function profileEntryToSortRow(entry) {
  return {
    entry,
    firstName: entry.student?.firstName,
    lastName: entry.student?.lastName,
    studentCode: entry.student?.studentCode,
    gender: entry.gender || entry.student?.gender,
    createdAt: entry.student?.createdAt,
    confirmedAt: entry.updatedAt || entry.student?.createdAt,
  }
}

export function sortProfileEntries(entries, sortBy = 'newest', sortDir = 'asc') {
  return sortStudentRows(entries.map(profileEntryToSortRow), sortBy, sortDir).map((row) => row.entry)
}
