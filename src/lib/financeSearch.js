import { normalizeJalaliDate, toEnglishDigits } from '@/lib/financeDuplicates'
import { matchesSearch } from '@/lib/searchUtils'

export function hasFinanceData(student) {
  return (student.payments?.length > 0)
    || (student.schedules?.length > 0)
    || student.totalTuition != null
}

/** نوآموز با ثبت‌نام قطعی — برای لیست مدیریت مالی */
export function isConfirmedStudent(student) {
  return student.registrationStatus === 'Confirmed'
}

function normalizeCheckQuery(query) {
  return toEnglishDigits(String(query || '').trim().toLowerCase())
}

function getCheckYearMonth(record) {
  const dateStr = record.checkDate || record.dueDate
  if (dateStr) {
    const norm = normalizeJalaliDate(dateStr)
    const parts = norm.split('/')
    if (parts.length === 3) {
      const year = Number(parts[0])
      const month = Number(parts[1])
      if (year && month) return { year, month }
    }
  }
  if (record.dueYear && record.dueMonth) {
    return { year: record.dueYear, month: record.dueMonth }
  }
  if (record.payYear && record.payMonth) {
    return { year: record.payYear, month: record.payMonth }
  }
  return null
}

export function recordMatchesCheckNumber(record, query) {
  const q = normalizeCheckQuery(query)
  if (!q) return true
  const fields = [record.checkNumber, record.sayadiNumber]
  return fields.some((f) => f && normalizeCheckQuery(f).includes(q))
}

export function recordMatchesCheckDate(record, year, month) {
  const ym = getCheckYearMonth(record)
  if (!ym) return false
  if (year && ym.year !== Number(year)) return false
  if (month && ym.month !== Number(month)) return false
  return true
}

/** جمع‌آوری همه چک‌ها از پرداخت‌ها (تأییدشده) و اقساط (تأیید یا انتظار) */
export function collectStudentChecks(student) {
  const items = []

  for (const sc of student.schedules || []) {
    if (!sc.checkNumber && !sc.checkDate && !sc.dueDate) continue
    items.push({
      key: `sc-${sc.id}`,
      studentId: student.studentId,
      studentName: student.fullName,
      nationalId: student.nationalId,
      gender: student.gender,
      source: 'schedule',
      checkNumber: sc.checkNumber || null,
      checkDate: sc.checkDate || sc.dueDate || null,
      sayadiNumber: sc.sayadiNumber || null,
      amount: sc.amountDue,
      amountFormatted: sc.amountFormatted,
      isPaid: Boolean(sc.isPaid),
      dueYear: sc.dueYear,
      dueMonth: sc.dueMonth,
    })
  }

  for (const p of student.payments || []) {
    if (!p.checkNumber && !p.checkDate) continue
    items.push({
      key: `pay-${p.id}`,
      studentId: student.studentId,
      studentName: student.fullName,
      nationalId: student.nationalId,
      gender: student.gender,
      source: 'payment',
      checkNumber: p.checkNumber || null,
      checkDate: p.checkDate || null,
      sayadiNumber: p.sayadiNumber || null,
      amount: p.amountPaid,
      amountFormatted: p.amountFormatted,
      isPaid: true,
      payYear: p.payYear,
      payMonth: p.payMonth,
    })
  }

  return items
}

export function searchFinanceChecks(students, {
  mode,
  checkQuery = '',
  year = '',
  month = '',
  nameQuery = '',
  gender = 'all',
}) {
  const results = []

  for (const student of students) {
    if (!isConfirmedStudent(student)) continue
    if (gender !== 'all' && student.gender !== gender) continue
    if (!matchesSearch(nameQuery, student.firstName, student.lastName, student.fullName, student.nationalId)) {
      continue
    }

    for (const check of collectStudentChecks(student)) {
      if (mode === 'check' && checkQuery.trim()) {
        if (recordMatchesCheckNumber(check, checkQuery)) results.push(check)
      } else if (mode === 'date' && (year || month)) {
        if (recordMatchesCheckDate(check, year, month)) results.push(check)
      }
    }
  }

  return results
}

/** فیلتر لیست نوآموزان — فقط ثبت‌نام قطعی */
export function filterFinanceStudents(students, { nameQuery = '', gender = 'all' }) {
  return students.filter((s) => {
    if (!isConfirmedStudent(s)) return false
    if (gender !== 'all' && s.gender !== gender) return false
    if (!matchesSearch(nameQuery, s.firstName, s.lastName, s.fullName, s.nationalId)) return false
    return true
  })
}
