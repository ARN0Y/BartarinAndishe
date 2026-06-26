/** @returns {{ label: string, displayRial: number, tone: 'debt' | 'settled' | 'credit' } | null} */
export function getInvoiceBalanceDisplay(remaining) {
  if (remaining === null || remaining === undefined) return null
  if (remaining > 0) {
    return { label: 'مانده قابل پرداخت', displayRial: remaining, tone: 'debt' }
  }
  if (remaining === 0) {
    return { label: 'مانده قابل پرداخت', displayRial: 0, tone: 'settled' }
  }
  return { label: 'مازاد پرداخت (بستانکاری)', displayRial: Math.abs(remaining), tone: 'credit' }
}

export function formatBalanceToman(rial) {
  const toman = Math.floor(Math.abs(rial) / 10)
  const formatted = new Intl.NumberFormat('fa-IR').format(toman)
  return rial < 0 ? `−${formatted} تومان` : `${formatted} تومان`
}
