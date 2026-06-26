import { prisma } from '@/lib/prisma'
import { validateSayadiNumber, normalizeSayadiNumber } from '@/lib/sayadiNumber'
import { formatCurrency } from '@/lib/formatters'

export const LINE_TYPES = {
  cash: { key: 'cash', label: 'نقدی' },
  check: { key: 'check', label: 'چک' },
}

export const CHECK_KINDS = {
  amanat: { key: 'amanat', label: 'امانت' },
  sarhesab: { key: 'sarhesab', label: 'سرحساب' },
}

function emptyAmanatCashRows() {
  return [{ sortOrder: 0, paymentDate: '', amount: 0 }]
}

function formatAmanatRowForApi(row) {
  return {
    id: row.id,
    sortOrder: row.sortOrder,
    paymentDate: row.paymentDate,
    amount: row.amount,
    amountFormatted: row.amount ? formatCurrency(row.amount) : '',
  }
}

function formatLineForApi(line) {
  return {
    id: line.id,
    sortOrder: line.sortOrder,
    lineType: line.lineType,
    lineTypeLabel: LINE_TYPES[line.lineType]?.label || line.lineType,
    amount: line.amount,
    amountFormatted: formatCurrency(line.amount),
    paymentDate: line.paymentDate,
    description: line.description || '',
    checkNumber: line.checkNumber || '',
    bankName: line.bankName || '',
    bankBranch: line.bankBranch || '',
    checkOwner: line.checkOwner || '',
    sayadiNumber: line.sayadiNumber || '',
    checkKind: line.checkKind || null,
    checkKindLabel: line.checkKind ? CHECK_KINDS[line.checkKind]?.label || line.checkKind : null,
    amanatCashRows: (line.amanatCashRows || []).map(formatAmanatRowForApi),
  }
}

export function formatFinancialPlanForApi(plan) {
  if (!plan) {
    return {
      id: null,
      readyForParent: false,
      completedAt: null,
      lines: [],
      hasAmanatChecks: false,
    }
  }

  const lines = (plan.lines || []).map(formatLineForApi)
  const hasAmanatChecks = lines.some((l) => l.lineType === 'check' && l.checkKind === 'amanat')

  return {
    id: plan.id,
    readyForParent: plan.readyForParent,
    completedAt: plan.completedAt,
    lines,
    hasAmanatChecks,
  }
}

const lineInclude = {
  lines: {
    orderBy: { sortOrder: 'asc' },
    include: {
      amanatCashRows: { orderBy: { sortOrder: 'asc' } },
    },
  },
}

export async function getOrCreateFinancialPlan(studentId) {
  let plan = await prisma.studentFinancialPlan.findUnique({
    where: { studentId },
    include: lineInclude,
  })

  if (!plan) {
    plan = await prisma.studentFinancialPlan.create({
      data: { studentId },
      include: lineInclude,
    })
  }

  return plan
}

export async function getFinancialPlan(studentId) {
  return prisma.studentFinancialPlan.findUnique({
    where: { studentId },
    include: lineInclude,
  })
}

function validateCheckBankFields(line, label = 'چک') {
  if (!line.checkNumber) throw new Error(`شماره ${label} الزامی است.`)
  if (!line.bankName) throw new Error(`نام بانک ${label} الزامی است.`)
  if (!line.bankBranch) throw new Error(`شعبه بانک ${label} الزامی است.`)
  if (!line.checkOwner) throw new Error(`صاحب ${label} الزامی است.`)
  const sayadiErr = validateSayadiNumber(line.sayadiNumber)
  if (sayadiErr) throw new Error(sayadiErr)
}

function normalizeAmanatCashRows(rawRows) {
  const rows = Array.isArray(rawRows) ? rawRows.filter(Boolean) : []
  if (!rows.length) {
    throw new Error('برای چک امانت، حداقل یک ردیف پرداخت نقدی لازم است.')
  }

  return rows.map((raw, index) => {
    const paymentDate = String(raw.paymentDate || '').trim()
    const amount = Number(raw.amount)
    if (!paymentDate) throw new Error(`تاریخ ردیف ${index + 1} پرداخت نقدی امانت الزامی است.`)
    if (!amount || amount <= 0) throw new Error(`مبلغ ردیف ${index + 1} پرداخت نقدی امانت الزامی است.`)
    return { sortOrder: index, paymentDate, amount }
  })
}

function normalizeLine(raw, index) {
  const lineType = raw.lineType === 'check' ? 'check' : 'cash'
  const amount = Number(raw.amount)
  const paymentDate = String(raw.paymentDate || '').trim()

  if (!amount || amount <= 0) throw new Error('مبلغ هر ردیف باید بیشتر از صفر باشد.')
  if (!paymentDate) throw new Error('تاریخ هر ردیف الزامی است.')

  const line = {
    sortOrder: index,
    lineType,
    amount,
    paymentDate,
    description: raw.description?.trim() || null,
    checkNumber: null,
    bankName: null,
    bankBranch: null,
    checkOwner: null,
    sayadiNumber: null,
    checkKind: null,
    amanatCashRows: [],
  }

  if (lineType === 'check') {
    line.checkNumber = raw.checkNumber?.trim() || null
    line.bankName = raw.bankName?.trim() || null
    line.bankBranch = raw.bankBranch?.trim() || null
    line.checkOwner = raw.checkOwner?.trim() || null
    line.sayadiNumber = normalizeSayadiNumber(raw.sayadiNumber) || null
    const kind = raw.checkKind === 'sarhesab' ? 'sarhesab' : raw.checkKind === 'amanat' ? 'amanat' : null
    if (!kind) throw new Error('نوع چک (امانت یا سرحساب) الزامی است.')
    line.checkKind = kind
    validateCheckBankFields(line)

    if (kind === 'amanat') {
      line.amanatCashRows = normalizeAmanatCashRows(raw.amanatCashRows)
    }
  }

  return line
}

export async function saveFinancialPlan(studentId, payload) {
  const lines = Array.isArray(payload.lines) ? payload.lines.map(normalizeLine) : []

  const existing = await prisma.studentFinancialPlan.findUnique({ where: { studentId } })

  if (existing?.readyForParent) {
    const contract = await prisma.tuitionContract.findUnique({ where: { studentId } })
    if (contract) {
      throw new Error('قرارداد توسط والدین امضا شده — امکان ویرایش برنامه مالی وجود ندارد.')
    }
  }

  const plan = await prisma.$transaction(async (tx) => {
    const base = existing
      ? await tx.studentFinancialPlan.update({
          where: { studentId },
          data: { readyForParent: false, completedAt: null },
        })
      : await tx.studentFinancialPlan.create({ data: { studentId } })

    const oldLines = await tx.contractPaymentLine.findMany({
      where: { planId: base.id },
      select: { id: true },
    })
    if (oldLines.length) {
      await tx.contractAmanatCashRow.deleteMany({
        where: { lineId: { in: oldLines.map((l) => l.id) } },
      })
    }
    await tx.contractPaymentLine.deleteMany({ where: { planId: base.id } })

    for (const line of lines) {
      const { amanatCashRows, ...lineData } = line
      const created = await tx.contractPaymentLine.create({
        data: { ...lineData, planId: base.id },
      })
      if (amanatCashRows?.length) {
        await tx.contractAmanatCashRow.createMany({
          data: amanatCashRows.map((row) => ({ ...row, lineId: created.id })),
        })
      }
    }

    return tx.studentFinancialPlan.findUnique({
      where: { id: base.id },
      include: lineInclude,
    })
  })

  return plan
}

export async function markFinancialPlanReady(studentId) {
  const plan = await getOrCreateFinancialPlan(studentId)

  if (!plan.lines.length) {
    throw new Error('حداقل یک ردیف نقدی یا چک برای قرارداد مالی تعریف کنید.')
  }

  for (const line of plan.lines) {
    if (line.lineType !== 'check') continue
    validateCheckBankFields(line, 'چک')
    if (line.checkKind === 'amanat') {
      if (!(line.amanatCashRows || []).length) {
        throw new Error(`برای چک امانت شماره ${line.checkNumber || '—'}، حداقل یک ردیف پرداخت نقدی لازم است.`)
      }
      for (let i = 0; i < line.amanatCashRows.length; i++) {
        const row = line.amanatCashRows[i]
        if (!row.paymentDate || !row.amount) {
          throw new Error(`ردیف ${i + 1} پرداخت نقدی چک امانت شماره ${line.checkNumber || '—'} ناقص است.`)
        }
      }
    }
  }

  return prisma.studentFinancialPlan.update({
    where: { studentId },
    data: { readyForParent: true, completedAt: new Date() },
    include: lineInclude,
  })
}

export async function reopenFinancialPlan(studentId) {
  const contract = await prisma.tuitionContract.findUnique({ where: { studentId } })
  if (contract) {
    throw new Error('قرارداد امضا شده — امکان بازگشایی وجود ندارد.')
  }

  return prisma.studentFinancialPlan.update({
    where: { studentId },
    data: { readyForParent: false, completedAt: null },
    include: lineInclude,
  })
}

export { emptyAmanatCashRows }
