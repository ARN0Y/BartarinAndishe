import { dateToJalali } from '@/lib/jalali'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('fa-IR').format(amount)
}

/** تاریخ شمسی به فرمت سال/ماه/روز — مثال: 1405/03/07 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return dateToJalali(d)
}

export function fullName(student) {
  return `${student.firstName} ${student.lastName}`.trim()
}

export function registrationStatusLabel(status) {
  return status === 'Confirmed' ? 'ثبت‌نام قطعی' : 'در حال بررسی'
}

export function paymentStatusLabel(status) {
  if (status === 'Success') return 'موفق'
  if (status === 'Failed') return 'ناموفق'
  return 'در انتظار'
}
