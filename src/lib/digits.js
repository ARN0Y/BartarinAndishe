export function toEnglishDigits(value) {
  return String(value ?? '').replace(/[\u06f0-\u06f9\u0660-\u0669]/g, (digit) => {
    const code = digit.charCodeAt(0)
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
    return String(code - 0x0660)
  })
}

export function onlyEnglishDigits(value) {
  return toEnglishDigits(value).replace(/\D/g, '')
}
