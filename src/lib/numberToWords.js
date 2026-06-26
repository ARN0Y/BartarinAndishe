const ONES = [
  '', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه',
  'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده',
  'هفده', 'هجده', 'نوزده',
]
const TENS     = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود']
const HUNDREDS = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد']

function toWords(n) {
  if (n === 0) return 'صفر'
  if (n < 0)   return 'منفی ' + toWords(-n)

  const parts = []

  if (n >= 1_000_000_000) {
    parts.push(toWords(Math.floor(n / 1_000_000_000)) + ' میلیارد')
    n %= 1_000_000_000
  }
  if (n >= 1_000_000) {
    parts.push(toWords(Math.floor(n / 1_000_000)) + ' میلیون')
    n %= 1_000_000
  }
  if (n >= 1_000) {
    const th = Math.floor(n / 1_000)
    parts.push((th === 1 ? '' : toWords(th) + ' ') + 'هزار')
    n %= 1_000
  }
  if (n >= 100) {
    parts.push(HUNDREDS[Math.floor(n / 100)])
    n %= 100
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)])
    n %= 10
  }
  if (n > 0) {
    parts.push(ONES[n])
  }

  return parts.join(' و ')
}

/**
 * مبلغ به ریال را به تومان به حروف برمی‌گرداند
 * مثال: 50000000 → "پنج میلیون تومان"
 */
export function rialToTomanWords(rial) {
  const n = Math.floor(Number(rial))
  if (!n || isNaN(n) || n <= 0) return ''
  const toman = Math.floor(n / 10)
  if (toman === 0) return ''
  return toWords(toman) + ' تومان'
}

/** مبلغ به ریال به حروف — برای قرارداد شهریه */
export function rialToWords(rial) {
  const n = Math.floor(Number(rial))
  if (!n || isNaN(n) || n <= 0) return ''
  return toWords(n) + ' ریال'
}
