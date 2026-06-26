import { formatCurrency } from '@/lib/formatters'

/** چک وثیقه/امانت — قسط پرداخت نیست */
export function isAmanatCollateralSchedule(schedule) {
  const desc = String(schedule?.description || '')
  if (desc.includes('پرداخت نقدی چک امانت')) return false
  return desc.startsWith('امانت')
}

export function splitInvoiceSchedules(schedules = []) {
  const amanatCollateral = []
  const installments = []
  for (const sc of schedules) {
    if (isAmanatCollateralSchedule(sc)) amanatCollateral.push(sc)
    else installments.push(sc)
  }
  return { amanatCollateral, installments }
}

function noteFromSchedule(sc) {
  const parts = ['چک امانت']
  if (sc.checkNumber) parts.push(`شماره ${sc.checkNumber}`)
  if (sc.amountDue) parts.push(`مبلغ ${formatCurrency(sc.amountDue)} ریال`)
  if (sc.checkDate || sc.dueDate) parts.push(`تاریخ ${sc.checkDate || sc.dueDate}`)
  if (sc.bankName) parts.push(`بانک ${sc.bankName}${sc.bankBranch ? ` / ${sc.bankBranch}` : ''}`)
  if (sc.checkOwner) parts.push(`صاحب: ${sc.checkOwner}`)
  if (sc.sayadiNumber) parts.push(`صیادی: ${sc.sayadiNumber}`)
  const desc = String(sc.description || '')
    .replace(/^امانت\s*—\s*/u, '')
    .replace(/\s*—\s*ثبت از قرارداد\s*$/u, '')
    .trim()
  if (desc && desc !== 'امانت') parts.push(desc)
  return parts.join(' — ')
}

function noteFromPlanLine(line) {
  const parts = ['چک امانت']
  if (line.checkNumber) parts.push(`شماره ${line.checkNumber}`)
  if (line.amount) parts.push(`مبلغ ${formatCurrency(line.amount)} ریال`)
  if (line.paymentDate) parts.push(`تاریخ ${line.paymentDate}`)
  if (line.bankName) parts.push(`بانک ${line.bankName}${line.bankBranch ? ` / ${line.bankBranch}` : ''}`)
  if (line.checkOwner) parts.push(`صاحب: ${line.checkOwner}`)
  if (line.sayadiNumber) parts.push(`صیادی: ${line.sayadiNumber}`)
  if (line.description?.trim()) parts.push(line.description.trim())
  return parts.join(' — ')
}

export function buildAmanatCollateralNotes(schedules = [], planLines = []) {
  const notes = []
  const seen = new Set()

  for (const sc of schedules.filter(isAmanatCollateralSchedule)) {
    const key = sc.checkNumber || sc.id
    if (seen.has(key)) continue
    seen.add(key)
    notes.push(noteFromSchedule(sc))
  }

  for (const line of planLines.filter((l) => l.lineType === 'check' && l.checkKind === 'amanat')) {
    const key = line.checkNumber || line.id
    if (seen.has(key)) continue
    seen.add(key)
    notes.push(noteFromPlanLine(line))
  }

  return notes
}
