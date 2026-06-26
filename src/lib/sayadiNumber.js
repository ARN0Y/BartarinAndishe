import { onlyEnglishDigits } from '@/lib/digits'

export const SAYADI_LENGTH = 16

export function normalizeSayadiNumber(value) {
  return onlyEnglishDigits(value).slice(0, SAYADI_LENGTH)
}

export function isValidSayadiNumber(value) {
  return normalizeSayadiNumber(value).length === SAYADI_LENGTH
}

/** @returns {string|null} پیام خطا یا null */
export function validateSayadiNumber(value, { required = true } = {}) {
  const digits = normalizeSayadiNumber(value)
  if (!digits) {
    return required ? 'شناسه صیادی الزامی است.' : null
  }
  if (digits.length !== SAYADI_LENGTH) {
    return `شناسه صیادی باید دقیقاً ${SAYADI_LENGTH} رقم باشد.`
  }
  return null
}
