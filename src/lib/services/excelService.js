import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { getAllStudentsWithPayments } from '@/lib/services/manualPaymentService'
import { getActiveAcademicYear, listAcademicYears, normalizeAcademicYear } from '@/lib/academicYear'
import { getContractSettings } from '@/lib/services/contractSettingsService'

const BRAND = 'کودکستان برترین اندیشه'
const COLORS = {
  navy: 'FF0F172A',
  slate: 'FF334155',
  muted: 'FFE2E8F0',
  soft: 'FFF8FAFC',
  white: 'FFFFFFFF',
  emerald: 'FF047857',
  amber: 'FFD97706',
  rose: 'FFE11D48',
  sky: 'FF0369A1',
}

function rial(value) {
  const n = Number(value) || 0
  return n
}

function money(value) {
  return rial(value).toLocaleString('en-US')
}

function toman(value) {
  return Math.floor(rial(value) / 10).toLocaleString('fa-IR')
}

function safeSheetName(name) {
  return String(name).replace(/[\\/*?:[\]]/g, '-').slice(0, 31)
}

function makeWorkbook() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = BRAND
  workbook.created = new Date()
  workbook.modified = new Date()
  workbook.properties.date1904 = false
  return workbook
}

function styleSheet(sheet) {
  sheet.views = [{ rightToLeft: true, state: 'frozen', ySplit: 2 }]
  sheet.properties.defaultRowHeight = 22
  sheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
  }
}

function title(sheet, text, width) {
  sheet.mergeCells(1, 1, 1, width)
  const cell = sheet.getCell(1, 1)
  cell.value = text
  cell.font = { bold: true, size: 13, color: { argb: COLORS.white }, name: 'Calibri' }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } }
  cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
  sheet.getRow(1).height = 32
}

function setColumns(sheet, columns) {
  sheet.columns = columns.map((col) => ({
    key: col.key,
    header: col.header,
    width: col.width,
    style: {
      alignment: { horizontal: col.align || 'right', vertical: 'middle', wrapText: true, readingOrder: 'rightToLeft' },
      font: { name: 'Calibri', size: 10 },
    },
  }))

  const row = sheet.getRow(2)
  row.values = columns.map((col) => col.header)
  row.height = 26
  row.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: COLORS.white }, name: 'Calibri' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slate } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rightToLeft' }
    cell.border = thinBorder()
  })
  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: columns.length },
  }
}

function thinBorder() {
  const side = { style: 'thin', color: { argb: 'FFD8DEE9' } }
  return { top: side, bottom: side, left: side, right: side }
}

function addRows(sheet, rows, columns) {
  rows.forEach((row, index) => {
    const added = sheet.addRow(row)
    added.height = 22
    added.eachCell((cell, colNumber) => {
      const col = columns[colNumber - 1]
      cell.alignment = {
        horizontal: col?.align || 'right',
        vertical: 'middle',
        wrapText: true,
        readingOrder: 'rightToLeft',
      }
      cell.font = { name: 'Calibri', size: 10 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 ? COLORS.white : COLORS.soft } }
      cell.border = thinBorder()
    })
  })
}

function applyCurrencyFormat(sheet, keys) {
  for (const key of keys) {
    const col = sheet.getColumn(key)
    col.numFmt = '#,##0'
  }
}

async function getFinanceRowsForYear(academicYear) {
  const students = await getAllStudentsWithPayments(academicYear)
  return students.map((student, index) => {
    const totalTuition = rial(student.totalTuition)
    const paid = rial(student.total)
    const remaining = student.totalTuition == null ? null : totalTuition - paid
    const openSchedules = (student.schedules || []).filter((s) => !s.isPaid)
    const openAmount = openSchedules.reduce((sum, s) => sum + rial(s.amountDue), 0)

    return {
      row: index + 1,
      studentCode: student.studentCode || '',
      fullName: student.fullName,
      nationalId: student.nationalId,
      gradeLevel: student.gradeLevel || '',
      gender: student.gender || '',
      totalTuition,
      paid,
      remaining: remaining == null ? '' : remaining,
      remainingToman: remaining == null ? '' : toman(remaining),
      status: remaining == null ? 'شهریه تعریف نشده' : remaining <= 0 ? 'تسویه' : 'مانده‌دار',
      paymentsCount: student.payments?.length || 0,
      openSchedules: openSchedules.length,
      openAmount,
    }
  })
}

async function addFinanceYearSheets(workbook, academicYear) {
  const rows = await getFinanceRowsForYear(academicYear)
  const summaryColumns = [
    { header: '#', key: 'row', width: 7, align: 'center' },
    { header: 'کد نوآموز', key: 'studentCode', width: 14 },
    { header: 'نام نوآموز', key: 'fullName', width: 24 },
    { header: 'کد ملی', key: 'nationalId', width: 16 },
    { header: 'پایه', key: 'gradeLevel', width: 16 },
    { header: 'جنسیت', key: 'gender', width: 10 },
    { header: 'شهریه کل (ریال)', key: 'totalTuition', width: 18 },
    { header: 'پرداخت‌شده (ریال)', key: 'paid', width: 18 },
    { header: 'مانده (ریال)', key: 'remaining', width: 18 },
    { header: 'مانده (تومان)', key: 'remainingToman', width: 18 },
    { header: 'وضعیت', key: 'status', width: 16 },
    { header: 'تعداد پرداخت', key: 'paymentsCount', width: 13, align: 'center' },
    { header: 'اقساط باز', key: 'openSchedules', width: 12, align: 'center' },
    { header: 'جمع اقساط باز (ریال)', key: 'openAmount', width: 20 },
  ]
  const summary = workbook.addWorksheet(safeSheetName(`مالی ${academicYear}`))
  styleSheet(summary)
  title(summary, `${BRAND} - خلاصه مالی سال تحصیلی ${academicYear}`, summaryColumns.length)
  setColumns(summary, summaryColumns)
  addRows(summary, rows, summaryColumns)
  applyCurrencyFormat(summary, ['totalTuition', 'paid', 'remaining', 'openAmount'])

  const transactionRows = []
  const scheduleRows = []
  const students = await getAllStudentsWithPayments(academicYear)
  students.forEach((student) => {
    ;(student.payments || []).forEach((payment, index) => {
      const isCheck = Boolean(payment.checkNumber || payment.checkDate || payment.sayadiNumber)
      transactionRows.push({
        row: transactionRows.length + 1,
        fullName: student.fullName,
        nationalId: student.nationalId,
        paymentType: isCheck ? 'چک' : 'نقدی',
        date: payment.dateFormatted,
        amount: rial(payment.amountPaid),
        description: payment.description || '',
        checkNumber: payment.checkNumber || '',
        checkDate: payment.checkDate || '',
        checkStatus: isCheck ? 'وصول‌شده (تأیید پرداخت)' : '—',
        bankName: payment.bankName || '',
        sayadiNumber: payment.sayadiNumber || '',
        sequence: index + 1,
      })
    })
    ;(student.schedules || []).forEach((schedule) => {
      const isCheck = Boolean(schedule.checkNumber || schedule.checkDate || schedule.sayadiNumber)
      scheduleRows.push({
        row: scheduleRows.length + 1,
        fullName: student.fullName,
        nationalId: student.nationalId,
        paymentType: isCheck ? 'چک' : 'نقدی',
        dueDate: schedule.dueDate,
        amount: rial(schedule.amountDue),
        description: schedule.description || '',
        status: schedule.isPaid
          ? (isCheck ? 'وصول‌شده (تأیید پرداخت)' : 'پرداخت‌شده')
          : (isCheck ? 'چک در انتظار وصول' : 'در انتظار پرداخت'),
        checkNumber: schedule.checkNumber || '',
        checkDate: schedule.checkDate || '',
        bankName: schedule.bankName || '',
        sayadiNumber: schedule.sayadiNumber || '',
      })
    })
  })

  const paymentColumns = [
    { header: '#', key: 'row', width: 7, align: 'center' },
    { header: 'نام نوآموز', key: 'fullName', width: 24 },
    { header: 'کد ملی', key: 'nationalId', width: 16 },
    { header: 'نوع پرداخت', key: 'paymentType', width: 12, align: 'center' },
    { header: 'تاریخ پرداخت', key: 'date', width: 14 },
    { header: 'مبلغ (ریال)', key: 'amount', width: 18 },
    { header: 'توضیحات', key: 'description', width: 26 },
    { header: 'شماره چک', key: 'checkNumber', width: 16 },
    { header: 'تاریخ چک', key: 'checkDate', width: 14 },
    { header: 'وضعیت چک', key: 'checkStatus', width: 22 },
    { header: 'بانک', key: 'bankName', width: 15 },
    { header: 'صیادی', key: 'sayadiNumber', width: 20 },
    { header: 'ردیف برای دانش‌آموز', key: 'sequence', width: 16, align: 'center' },
  ]
  const payments = workbook.addWorksheet(safeSheetName(`پرداخت ${academicYear}`))
  styleSheet(payments)
  title(payments, `${BRAND} - ریز پرداخت‌های سال ${academicYear}`, paymentColumns.length)
  setColumns(payments, paymentColumns)
  addRows(payments, transactionRows, paymentColumns)
  applyCurrencyFormat(payments, ['amount'])

  const scheduleColumns = [
    { header: '#', key: 'row', width: 7, align: 'center' },
    { header: 'نام نوآموز', key: 'fullName', width: 24 },
    { header: 'کد ملی', key: 'nationalId', width: 16 },
    { header: 'نوع پرداخت', key: 'paymentType', width: 12, align: 'center' },
    { header: 'سررسید', key: 'dueDate', width: 14 },
    { header: 'مبلغ (ریال)', key: 'amount', width: 18 },
    { header: 'توضیحات', key: 'description', width: 26 },
    { header: 'وضعیت', key: 'status', width: 20 },
    { header: 'شماره چک', key: 'checkNumber', width: 16 },
    { header: 'تاریخ چک', key: 'checkDate', width: 14 },
    { header: 'بانک', key: 'bankName', width: 15 },
    { header: 'صیادی', key: 'sayadiNumber', width: 20 },
  ]
  const schedules = workbook.addWorksheet(safeSheetName(`اقساط ${academicYear}`))
  styleSheet(schedules)
  title(schedules, `${BRAND} - برنامه اقساط سال ${academicYear}`, scheduleColumns.length)
  setColumns(schedules, scheduleColumns)
  addRows(schedules, scheduleRows, scheduleColumns)
  applyCurrencyFormat(schedules, ['amount'])

  return rows
}

export async function buildPaymentsExcelBuffer({ academicYear, allYears = false } = {}) {
  const years = allYears
    ? await listAcademicYears()
    : [normalizeAcademicYear(academicYear || await getActiveAcademicYear())]
  const workbook = makeWorkbook()
  const overview = workbook.addWorksheet('خلاصه کل', { views: [{ rightToLeft: true, state: 'frozen', ySplit: 2 }] })

  const overviewRows = []
  for (const year of years) {
    const rows = await addFinanceYearSheets(workbook, year)
    overviewRows.push({
      year,
      students: rows.length,
      totalTuition: rows.reduce((sum, row) => sum + rial(row.totalTuition), 0),
      paid: rows.reduce((sum, row) => sum + rial(row.paid), 0),
      remaining: rows.reduce((sum, row) => sum + (typeof row.remaining === 'number' ? row.remaining : 0), 0),
      openSchedules: rows.reduce((sum, row) => sum + rial(row.openSchedules), 0),
      openAmount: rows.reduce((sum, row) => sum + rial(row.openAmount), 0),
    })
  }

  const overviewColumns = [
    { header: 'سال تحصیلی', key: 'year', width: 15 },
    { header: 'تعداد نوآموز', key: 'students', width: 14, align: 'center' },
    { header: 'جمع شهریه (ریال)', key: 'totalTuition', width: 20 },
    { header: 'جمع پرداخت‌شده (ریال)', key: 'paid', width: 22 },
    { header: 'جمع مانده (ریال)', key: 'remaining', width: 20 },
    { header: 'تعداد اقساط باز', key: 'openSchedules', width: 16, align: 'center' },
    { header: 'جمع اقساط باز (ریال)', key: 'openAmount', width: 22 },
  ]
  title(overview, `${BRAND} - خروجی جامع مالی`, overviewColumns.length)
  setColumns(overview, overviewColumns)
  addRows(overview, overviewRows, overviewColumns)
  applyCurrencyFormat(overview, ['totalTuition', 'paid', 'remaining', 'openAmount'])

  return {
    buffer: await workbook.xlsx.writeBuffer(),
    filename: allYears ? 'finance-invoices-all-years.xlsx' : `finance-invoices-${years[0]}.xlsx`,
  }
}

export async function buildAcademicYearsExcelBuffer() {
  const years = await listAcademicYears()
  const activeYear = await getActiveAcademicYear()
  const workbook = makeWorkbook()
  const rows = []

  for (const year of years) {
    const [
      students,
      preRegs,
      profilesComplete,
      contracts,
      manualPayments,
      schedules,
      settings,
    ] = await Promise.all([
      prisma.student.count({ where: { academicYear: year } }),
      prisma.preRegistration.count({ where: { academicYear: year } }),
      prisma.studentProfile.count({ where: { profileCompleted: true, student: { academicYear: year } } }),
      prisma.tuitionContract.count({ where: { student: { academicYear: year } } }),
      prisma.manualPayment.aggregate({ where: { academicYear: year }, _sum: { amountPaid: true }, _count: true }),
      prisma.paymentSchedule.aggregate({ where: { academicYear: year, isPaid: false }, _sum: { amountDue: true }, _count: true }),
      getContractSettings(year),
    ])
    rows.push({
      year,
      active: year === activeYear ? 'فعال' : '',
      preRegs,
      students,
      profilesComplete,
      contracts,
      tuition: Number(settings?.tuitionRial) || 0,
      paid: manualPayments._sum.amountPaid || 0,
      paymentRows: manualPayments._count,
      openSchedules: schedules._count,
      openAmount: schedules._sum.amountDue || 0,
    })
  }

  const columns = [
    { header: 'سال تحصیلی', key: 'year', width: 15 },
    { header: 'وضعیت', key: 'active', width: 12, align: 'center' },
    { header: 'پیش‌ثبت‌نام', key: 'preRegs', width: 14, align: 'center' },
    { header: 'نوآموز ثبت‌شده', key: 'students', width: 16, align: 'center' },
    { header: 'پرونده تکمیل', key: 'profilesComplete', width: 15, align: 'center' },
    { header: 'قرارداد امضا', key: 'contracts', width: 15, align: 'center' },
    { header: 'شهریه پایه (ریال)', key: 'tuition', width: 20 },
    { header: 'پرداخت‌شده (ریال)', key: 'paid', width: 20 },
    { header: 'تعداد پرداخت', key: 'paymentRows', width: 14, align: 'center' },
    { header: 'اقساط باز', key: 'openSchedules', width: 12, align: 'center' },
    { header: 'جمع اقساط باز (ریال)', key: 'openAmount', width: 22 },
  ]
  const sheet = workbook.addWorksheet('سال‌های تحصیلی')
  styleSheet(sheet)
  title(sheet, `${BRAND} - گزارش مدیریتی سال‌های تحصیلی`, columns.length)
  setColumns(sheet, columns)
  addRows(sheet, rows, columns)
  applyCurrencyFormat(sheet, ['tuition', 'paid', 'openAmount'])

  return {
    buffer: await workbook.xlsx.writeBuffer(),
    filename: 'academic-years-summary.xlsx',
  }
}
