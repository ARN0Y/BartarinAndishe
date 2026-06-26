// فیلدهای قابل‌ویرایش پروفایل نوآموز (فقط فیلدهای داده‌ای — بدون id/studentId/سیستمی)
export const PROFILE_EDITABLE_FIELDS = [
  // تب ۱ — مشخصات نوآموز
  'photoUrl', 'birthCertNumber', 'birthCertIssuePlace', 'birthDate', 'birthPlace',
  'gender', 'idCardRow', 'idCardSeries', 'idCardSerial',
  // تب ۲ — پدر
  'fatherNationalId', 'fatherBirthDate', 'fatherNationality', 'fatherFirstName', 'fatherLastName',
  'fatherPhone', 'fatherIdNumber', 'fatherIdIssuePlace', 'fatherEducation', 'fatherJob',
  // تب ۲ — مادر
  'motherNationalId', 'motherBirthDate', 'motherNationality', 'motherFirstName', 'motherLastName',
  'motherPhone', 'motherIdNumber', 'motherIdIssuePlace', 'motherEducation', 'motherJob',
  // تب ۳ — اطلاعات تکمیلی
  'housingStatus', 'leftHanded',
  // تب ۴ — آدرس و تماس
  'address', 'homePhone', 'postalCode', 'shadPhone', 'govPhone',
]

const BOOLEAN_FIELDS = new Set(['leftHanded'])

/**
 * فقط فیلدهای مجاز پروفایل را از ورودی برمی‌دارد و فیلدهای سیستمی
 * (id، studentId، createdAt، updatedAt، profileCompleted، student) را حذف می‌کند.
 * این کار از خطای Prisma هنگام ارسال دوبارهٔ رکورد کامل (مثلاً در ویرایش مدیر) جلوگیری می‌کند.
 */
export function pickProfileData(input = {}) {
  const out = {}
  for (const field of PROFILE_EDITABLE_FIELDS) {
    if (!(field in input)) continue
    let value = input[field]
    if (BOOLEAN_FIELDS.has(field)) {
      value = Boolean(value)
    } else if (value === '' || value === undefined) {
      value = null
    }
    out[field] = value
  }
  return out
}
