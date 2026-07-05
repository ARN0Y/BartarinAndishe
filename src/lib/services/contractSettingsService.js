import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { formatCurrency } from '@/lib/formatters'
import { rialToWords } from '@/lib/numberToWords'

export const CONTRACT_SETTINGS_PREFIX = 'contractSettings:'

export function contractSettingsKey(academicYear) {
  return `${CONTRACT_SETTINGS_PREFIX}${normalizeAcademicYear(academicYear)}`
}

const DEFAULTS = {
  tuitionRial: '',
  tuitionRialWords: '',
  managerSignatureUrl: '',
  managerStampUrl: '',
  founderSignatureUrl: '',
  uniformBoyToman: '',
  uniformGirlToman: '',
  // بازهٔ قیمت فرم (بستگی به سایز)
  uniformBoyFromToman: '',
  uniformBoyToToman: '',
  uniformGirlFromToman: '',
  uniformGirlToToman: '',
  bagSetToman: '',
}

const TOMAN_FIELDS = [
  'uniformBoyToman', 'uniformGirlToman', 'bagSetToman',
  'uniformBoyFromToman', 'uniformBoyToToman', 'uniformGirlFromToman', 'uniformGirlToToman',
]

function formatToman(value) {
  const n = Number(String(value || '').replace(/\D/g, ''))
  return n ? new Intl.NumberFormat('fa-IR').format(n) : ''
}

export function parseContractSettings(raw) {
  if (!raw) return { ...DEFAULTS }
  try {
    const data = JSON.parse(raw)
    return { ...DEFAULTS, ...data }
  } catch {
    return { ...DEFAULTS }
  }
}

export async function getContractSettings(academicYear) {
  const key = contractSettingsKey(academicYear)
  const row = await prisma.appSetting.findUnique({ where: { key } })
  return parseContractSettings(row?.value)
}

export async function saveContractSettings(academicYear, payload) {
  const key = contractSettingsKey(academicYear)
  const current = await getContractSettings(academicYear)
  const tuitionRial = payload.tuitionRial !== undefined
    ? String(payload.tuitionRial || '').replace(/\D/g, '')
    : current.tuitionRial

  let tuitionRialWords = payload.tuitionRialWords !== undefined
    ? String(payload.tuitionRialWords || '').trim()
    : current.tuitionRialWords

  if (payload.autoWords && tuitionRial) {
    tuitionRialWords = rialToWords(Number(tuitionRial))
  }

  const next = {
    ...current,
    tuitionRial,
    tuitionRialWords,
    managerSignatureUrl: payload.managerSignatureUrl ?? current.managerSignatureUrl,
    managerStampUrl: payload.managerStampUrl ?? current.managerStampUrl,
    founderSignatureUrl: payload.founderSignatureUrl ?? current.founderSignatureUrl,
  }
  for (const field of TOMAN_FIELDS) {
    next[field] = payload[field] !== undefined
      ? String(payload[field] || '').replace(/\D/g, '')
      : current[field]
  }

  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  })

  return formatContractSettingsForDisplay(next)
}

export function formatContractSettingsForDisplay(settings) {
  const rial = Number(settings.tuitionRial) || 0
  return {
    ...settings,
    tuitionRialFormatted: rial ? `${formatCurrency(rial)} ریال` : '',
    uniformBoyTomanFormatted: formatToman(settings.uniformBoyToman),
    uniformGirlTomanFormatted: formatToman(settings.uniformGirlToman),
    uniformBoyFromTomanFormatted: formatToman(settings.uniformBoyFromToman),
    uniformBoyToTomanFormatted: formatToman(settings.uniformBoyToToman),
    uniformGirlFromTomanFormatted: formatToman(settings.uniformGirlFromToman),
    uniformGirlToTomanFormatted: formatToman(settings.uniformGirlToToman),
    bagSetTomanFormatted: formatToman(settings.bagSetToman),
  }
}
