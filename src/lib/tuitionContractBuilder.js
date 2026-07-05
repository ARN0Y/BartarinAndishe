import { formatCurrency, fullName } from '@/lib/formatters'
import { dateToJalali } from '@/lib/jalali'
import { rialToWords } from '@/lib/numberToWords'
import { tuitionContractMeta, SIGNER_ROLES } from '@/data/tuitionContractMeta'
import { formatAcademicYearDisplay } from '@/lib/academicYear'
import { CHECK_KINDS, LINE_TYPES } from '@/lib/services/financialPlanService'

function formatAcademicYearLabel(academicYear) {
  return formatAcademicYearDisplay(academicYear)
}

/** تاریخ قرارداد = روزی که والد فرم قرارداد را تکمیل و ثبت می‌کند */
export function resolveContractDate(_profile, storedDate = null) {
  if (storedDate) return storedDate
  return dateToJalali(new Date())
}

function getSigner(profile, role) {
  const meta = SIGNER_ROLES[role] || SIGNER_ROLES.father
  const firstName = role === 'mother' ? profile.motherFirstName : profile.fatherFirstName
  const lastName = role === 'mother' ? profile.motherLastName : profile.fatherLastName
  const phone = role === 'mother' ? profile.motherPhone : profile.fatherPhone
  const full = `${firstName || ''} ${lastName || ''}`.trim()
  return {
    role,
    label: meta.label,
    honorific: meta.honorific,
    firstName: firstName || '',
    lastName: lastName || '',
    fullName: full,
    parentLine: full ? `${meta.honorific} ${full}` : '',
    phone: phone || '',
  }
}

function formatTomanFromRial(rial) {
  if (!rial) return ''
  return new Intl.NumberFormat('fa-IR').format(Math.floor(Number(rial) / 10))
}

function formatToman(value) {
  const n = Number(String(value || '').replace(/\D/g, ''))
  return n ? new Intl.NumberFormat('fa-IR').format(n) : ''
}

function buildPaymentTypeDate(line) {
  if (line.lineType === 'cash') {
    const label = LINE_TYPES.cash.label
    const desc = line.description ? ` (${line.description})` : ''
    return `${label}${desc} — ${line.paymentDate}`
  }
  const kindLabel = line.checkKind ? CHECK_KINDS[line.checkKind]?.label : ''
  const typePart = kindLabel ? `${LINE_TYPES.check.label} (${kindLabel})` : LINE_TYPES.check.label
  const desc = line.description ? ` (${line.description})` : ''
  return `${typePart}${desc} — ${line.paymentDate}`
}

function buildPaymentRowsFromPlan(lines = []) {
  return lines.map((line, index) => ({
    row: index + 1,
    paymentTypeDate: buildPaymentTypeDate(line),
    checkNumber: line.checkNumber || (line.lineType === 'cash' ? '—' : ''),
    bankName: line.bankName || '—',
    bankBranch: line.bankBranch || '—',
    amountRial: line.amount ? formatCurrency(line.amount) : '',
    amountRaw: line.amount || 0,
    lineType: line.lineType,
    checkKind: line.checkKind || null,
  }))
}

function buildAmanatCashSchedules(lines = []) {
  return lines
    .filter((line) => line.lineType === 'check' && line.checkKind === 'amanat')
    .map((line) => ({
      checkNumber: line.checkNumber || '',
      rows: (line.amanatCashRows || []).map((row, index) => ({
        row: index + 1,
        paymentDate: row.paymentDate,
        amountRial: row.amount ? formatCurrency(row.amount) : '',
        amountToman: formatTomanFromRial(row.amount),
        amountRaw: row.amount || 0,
      })),
    }))
}

function padPaymentRows(rows) {
  const padded = [...rows]
  while (padded.length < 5) {
    padded.push({
      row: padded.length + 1,
      paymentTypeDate: '',
      checkNumber: '',
      bankName: '',
      bankBranch: '',
      amountRial: '',
      amountRaw: 0,
    })
  }
  return padded
}

export function buildTuitionContractFields({
  student,
  profile = {},
  financialPlan = null,
  gradeLevel = null,
  signerRole = 'father',
  contractDate = null,
  academicYear = null,
  contractSettings = null,
  parentSignatureUrl = '',
  amanatCommitmentAccepted = false,
  customArticles = [],
}) {
  const signer = getSigner(profile, signerRole)
  const studentFullName = fullName(student)
  const settings = contractSettings || {}
  const tuitionRial = Number(settings.tuitionRial) || 0
  const tuitionRialWords = settings.tuitionRialWords || (tuitionRial ? rialToWords(tuitionRial) : '')
  const jalaliDate = resolveContractDate(profile, contractDate)
  const gradeLabel = gradeLevel || 'پیش‌دبستانی ۲'
  const resolvedYear = academicYear || student?.academicYear

  const planLines = financialPlan?.lines || []
  const hasAmanatChecks = planLines.some((l) => l.lineType === 'check' && l.checkKind === 'amanat')
  const amanatCashSchedules = buildAmanatCashSchedules(planLines)
  const paymentRows = padPaymentRows(buildPaymentRowsFromPlan(planLines))

  return {
    contractDate: jalaliDate,
    academicYear: formatAcademicYearLabel(resolvedYear),
    logoUrl: '/images/logo.svg',
    managerName: tuitionContractMeta.managerName,
    managerTitle: tuitionContractMeta.managerTitle,
    parentLine: signer.parentLine,
    parentFullName: signer.fullName,
    signerRole: signer.role,
    signerLabel: signer.label,
    signerHonorific: signer.honorific,
    studentFullName,
    homePhone: profile.homePhone || '',
    mobilePhone: signer.phone || profile.shadPhone || profile.govPhone || '',
    address: profile.address || '',
    tuitionRial,
    tuitionRialFormatted: tuitionRial ? `${formatCurrency(tuitionRial)}` : '',
    tuitionRialWords,
    gradeLabel,
    paymentRows,
    amanatCashSchedules,
    hasAmanatChecks,
    amanatCommitmentAccepted: Boolean(amanatCommitmentAccepted),
    financialPlanReady: Boolean(financialPlan?.readyForParent),
    bankAccount: tuitionContractMeta.bankAccount,
    bankName: tuitionContractMeta.bankName,
    accountHolder: tuitionContractMeta.accountHolder,
    accountNationalId: tuitionContractMeta.accountNationalId,
    founderName: tuitionContractMeta.founderName,
    founderTitle: tuitionContractMeta.founderTitle,
    schoolName: tuitionContractMeta.schoolName,
    copiesNote: tuitionContractMeta.copiesNote,
    managerSignatureUrl: settings.managerSignatureUrl || '',
    managerStampUrl: settings.managerStampUrl || '',
    founderSignatureUrl: settings.founderSignatureUrl || '',
    parentSignatureUrl: parentSignatureUrl || '',
    uniformBoyToman: formatToman(settings.uniformBoyToman),
    uniformGirlToman: formatToman(settings.uniformGirlToman),
    uniformBoyFromToman: formatToman(settings.uniformBoyFromToman),
    uniformBoyToToman: formatToman(settings.uniformBoyToToman),
    uniformGirlFromToman: formatToman(settings.uniformGirlFromToman),
    uniformGirlToToman: formatToman(settings.uniformGirlToToman),
    bagSetToman: formatToman(settings.bagSetToman),
    articles: Array.isArray(customArticles) ? customArticles : [],
  }
}

export function validateSignerProfile(profile, signerRole) {
  const signer = getSigner(profile || {}, signerRole)
  const missing = []
  if (!signer.fullName) missing.push(`نام ${signer.label}`)
  if (!signer.phone) missing.push(`موبایل ${signer.label}`)
  if (!profile?.address) missing.push('آدرس منزل')
  if (!profile?.homePhone) missing.push('تلفن منزل')
  return missing
}
