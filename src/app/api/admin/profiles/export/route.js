import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'
import { getContractSettings } from '@/lib/services/contractSettingsService'
import ExcelJS from 'exceljs'

// ─── برچسب‌های ثابت ───────────────────────────────────────────
const EDU = {
  diploma: 'دیپلم', assoc: 'فوق دیپلم', bachelor: 'لیسانس',
  master: 'فوق لیسانس', phd: 'دکتری', seminary: 'حوزوی',
}
const JOB = {
  unemployed: 'بیکار', labor: 'کارگر', private_employee: 'کارمند غیردولتی',
  freelance_art: 'آزاد هنری', agriculture: 'کشاورزی/دامداری',
  freelance_industry: 'آزاد صنعتی', gov_employee: 'کارمند دولت',
  housewife: 'خانه‌دار', health: 'بهداشتی', military: 'نظامی', cultural: 'فرهنگی',
}
const HOUSING = {
  own_family: 'شخصی', rent_family: 'اجاره‌ای',
  org_family: 'سازمانی', other_family: 'سایر', relatives: 'منزل بستگان',
}
const lbl = (map, key) => map[key] || key || '—'

// ─── رنگ‌های بخش‌ها ───────────────────────────────────────────
const COLOR = {
  title:   'FF1B3A6B',  // آبی تیره (عنوان فایل)
  serial:  'FF2C3E50',  // ردیف/سریال
  student: 'FF1565C0',  // مشخصات نوآموز
  father:  'FF2E7D32',  // اطلاعات پدر
  mother:  'FFC62828',  // اطلاعات مادر
  extra:   'FF6A1B9A',  // اطلاعات تکمیلی
  address: 'FF00695C',  // آدرس و تماس
  finance: 'FFE65100',  // امور مالی
  white:   'FFFFFFFF',
  rowA:    'FFF5F5F5',
  rowB:    'FFFFFFFF',
}

function cell(ws, row, col, value, opts = {}) {
  const c = ws.getCell(row, col)
  c.value = value
  c.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true, readingOrder: 'rightToLeft' }
  if (opts.bold)     c.font = { ...(c.font || {}), bold: true, size: opts.size || 10, color: { argb: opts.fgColor || 'FF000000' }, name: 'Calibri' }
  if (opts.fill)     c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } }
  if (opts.border)   c.border = opts.border
  return c
}

function headerCell(ws, row, col, value, bgColor) {
  const c = ws.getCell(row, col)
  c.value = value
  c.font = { bold: true, size: 10, color: { argb: COLOR.white }, name: 'Calibri' }
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
  c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rightToLeft' }
  c.border = {
    top: { style: 'thin', color: { argb: 'FFBBBBBB' } },
    bottom: { style: 'thin', color: { argb: 'FFBBBBBB' } },
    left: { style: 'thin', color: { argb: 'FFBBBBBB' } },
    right: { style: 'thin', color: { argb: 'FFBBBBBB' } },
  }
  return c
}

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('academicYear') || searchParams.get('year'))

    const contractSettings = await getContractSettings(academicYear)
    const yearTuition = Number(contractSettings?.tuitionRial) || null

    const students = await prisma.student.findMany({
      where: { registrationStatus: 'Confirmed', academicYear },
      include: {
        profile: true,
        manualPayments: { select: { amountPaid: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    const wb = new ExcelJS.Workbook()
    wb.creator = 'کودکستان برترین اندیشه'
    wb.created = new Date()
    wb.modified = new Date()

    // ════════════════════════════════════════════════════════════
    // ورق ۱: اطلاعات کامل نوآموزان
    // ════════════════════════════════════════════════════════════
    const ws = wb.addWorksheet('مشخصات نوآموزان', {
      views: [{ rightToLeft: true, state: 'frozen', xSplit: 0, ySplit: 3 }],
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    })

    // ── ردیف ۱: عنوان فایل ──
    ws.mergeCells('A1:AK1')
    const titleCell = ws.getCell('A1')
    titleCell.value = `کودکستان برترین اندیشه — لیست نوآموزان ثبت‌نام قطعی   |   تاریخ خروجی: ${new Date().toLocaleDateString('fa-IR')}`
    titleCell.font = { bold: true, size: 14, color: { argb: COLOR.white }, name: 'Calibri' }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.title } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
    ws.getRow(1).height = 36

    // ── ردیف ۲: گروه‌بندی ستون‌ها ──
    // ردیف / مشخصات نوآموز / والدین (پدر) / والدین (مادر) / تکمیلی / آدرس / مالی
    const groups = [
      { label: 'ردیف', cols: 1,  color: COLOR.serial  },
      { label: 'مشخصات نوآموز', cols: 11, color: COLOR.student },
      { label: 'اطلاعات پدر', cols: 9,  color: COLOR.father  },
      { label: 'اطلاعات مادر', cols: 9,  color: COLOR.mother  },
      { label: 'اطلاعات تکمیلی', cols: 2,  color: COLOR.extra   },
      { label: 'آدرس و تماس', cols: 5,  color: COLOR.address },
      { label: 'امور مالی', cols: 3,  color: COLOR.finance },
    ]

    let colCursor = 1
    for (const g of groups) {
      const start = colCursor
      const end = colCursor + g.cols - 1
      if (g.cols > 1) ws.mergeCells(2, start, 2, end)
      const c = ws.getCell(2, start)
      c.value = g.label
      c.font = { bold: true, size: 11, color: { argb: COLOR.white }, name: 'Calibri' }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: g.color } }
      c.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
      colCursor = end + 1
    }
    ws.getRow(2).height = 28

    // ── ردیف ۳: سرستون‌های جزئی ──
    const COL_DEFS = [
      // ردیف
      { label: '#', color: COLOR.serial, width: 6 },
      // نوآموز (12 ستون)
      { label: 'نام', color: COLOR.student, width: 14 },
      { label: 'نام خانوادگی', color: COLOR.student, width: 16 },
      { label: 'کد ملی', color: COLOR.student, width: 14 },
      { label: 'شماره شناسنامه', color: COLOR.student, width: 16 },
      { label: 'محل صدور ش.ش', color: COLOR.student, width: 14 },
      { label: 'تاریخ تولد', color: COLOR.student, width: 13 },
      { label: 'محل تولد', color: COLOR.student, width: 14 },
      { label: 'جنسیت', color: COLOR.student, width: 10 },
      { label: 'ردیف ش.ش', color: COLOR.student, width: 10 },
      { label: 'سری ش.ش', color: COLOR.student, width: 10 },
      { label: 'سریال ش.ش', color: COLOR.student, width: 12 },
      // پدر (9 ستون)
      { label: 'نام پدر', color: COLOR.father, width: 13 },
      { label: 'نام خانوادگی پدر', color: COLOR.father, width: 16 },
      { label: 'کد ملی پدر', color: COLOR.father, width: 14 },
      { label: 'تاریخ تولد پدر', color: COLOR.father, width: 13 },
      { label: 'ملیت پدر', color: COLOR.father, width: 10 },
      { label: 'موبایل پدر', color: COLOR.father, width: 13 },
      { label: 'ش.ش پدر', color: COLOR.father, width: 13 },
      { label: 'محل صدور پدر', color: COLOR.father, width: 14 },
      { label: 'تحصیلات پدر', color: COLOR.father, width: 14 },
      { label: 'شغل پدر', color: COLOR.father, width: 15 },
      // مادر (9 ستون)
      { label: 'نام مادر', color: COLOR.mother, width: 13 },
      { label: 'نام خانوادگی مادر', color: COLOR.mother, width: 16 },
      { label: 'کد ملی مادر', color: COLOR.mother, width: 14 },
      { label: 'تاریخ تولد مادر', color: COLOR.mother, width: 13 },
      { label: 'ملیت مادر', color: COLOR.mother, width: 10 },
      { label: 'موبایل مادر', color: COLOR.mother, width: 13 },
      { label: 'ش.ش مادر', color: COLOR.mother, width: 13 },
      { label: 'محل صدور مادر', color: COLOR.mother, width: 14 },
      { label: 'تحصیلات مادر', color: COLOR.mother, width: 14 },
      { label: 'شغل مادر', color: COLOR.mother, width: 15 },
      // تکمیلی (2 ستون)
      { label: 'وضعیت مسکن', color: COLOR.extra, width: 16 },
      { label: 'چپ دست', color: COLOR.extra, width: 10 },
      // آدرس (5 ستون)
      { label: 'آدرس منزل', color: COLOR.address, width: 30 },
      { label: 'تلفن منزل', color: COLOR.address, width: 13 },
      { label: 'کد پستی', color: COLOR.address, width: 13 },
      { label: 'موبایل شاد', color: COLOR.address, width: 13 },
      { label: 'موبایل درگاه', color: COLOR.address, width: 13 },
      // مالی (3 ستون)
      { label: 'مبلغ کل شهریه (ریال)', color: COLOR.finance, width: 22 },
      { label: 'مجموع پرداخت‌شده (ریال)', color: COLOR.finance, width: 22 },
      { label: 'مانده (ریال)', color: COLOR.finance, width: 20 },
    ]

    COL_DEFS.forEach((def, i) => {
      headerCell(ws, 3, i + 1, def.label, def.color)
      ws.getColumn(i + 1).width = def.width
    })
    ws.getRow(3).height = 26

    // فیلتر خودکار از ردیف سوم
    ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: COL_DEFS.length } }

    // ── ردیف‌های داده ──
    const thin = { style: 'thin', color: { argb: 'FFDDDDDD' } }
    const border = { top: thin, bottom: thin, left: thin, right: thin }

    students.forEach((s, i) => {
      const p = s.profile || {}
      const rowNum = i + 4
      const isEven = i % 2 === 0
      const rowFill = isEven ? COLOR.rowA : COLOR.rowB

      const values = [
        i + 1,
        s.firstName, s.lastName, s.nationalId,
        p.birthCertNumber || '', p.birthCertIssuePlace || '',
        p.birthDate || '', p.birthPlace || '',
        p.gender === 'male' ? 'پسر' : p.gender === 'female' ? 'دختر' : (p.gender || ''),
        p.idCardRow || '', p.idCardSeries || '', p.idCardSerial || '',
        p.fatherFirstName || '', p.fatherLastName || '', p.fatherNationalId || '',
        p.fatherBirthDate || '', p.fatherNationality === 'iranian' ? 'ایرانی' : p.fatherNationality || '',
        p.fatherPhone || '', p.fatherIdNumber || '', p.fatherIdIssuePlace || '',
        lbl(EDU, p.fatherEducation), lbl(JOB, p.fatherJob),
        p.motherFirstName || '', p.motherLastName || '', p.motherNationalId || '',
        p.motherBirthDate || '', p.motherNationality === 'iranian' ? 'ایرانی' : p.motherNationality || '',
        p.motherPhone || '', p.motherIdNumber || '', p.motherIdIssuePlace || '',
        lbl(EDU, p.motherEducation), lbl(JOB, p.motherJob),
        lbl(HOUSING, p.housingStatus), p.leftHanded ? 'بله' : 'خیر',
        p.address || '', p.homePhone || '', p.postalCode || '', p.shadPhone || '', p.govPhone || '',
        yearTuition ? yearTuition.toLocaleString('en-US') : '—',
        (() => {
          const paid = s.manualPayments.reduce((sum, m) => sum + m.amountPaid, 0)
          return paid > 0 ? paid.toLocaleString('en-US') : '۰'
        })(),
        (() => {
          if (!yearTuition) return '—'
          const paid = s.manualPayments.reduce((sum, m) => sum + m.amountPaid, 0)
          const remaining = yearTuition - paid
          return remaining <= 0 ? 'تسویه‌شده' : remaining.toLocaleString('en-US')
        })(),
      ]

      values.forEach((val, j) => {
        const c = ws.getCell(rowNum, j + 1)
        c.value = val
        c.alignment = { horizontal: j === 0 ? 'center' : 'right', vertical: 'middle', readingOrder: 'rightToLeft', wrapText: true }
        c.font = { size: 10, name: 'Calibri' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } }
        c.border = border
        if (j === 0) c.font = { ...c.font, bold: true }
      })

      ws.getRow(rowNum).height = 20
    })

    // ── ردیف جمع (آخر) ──
    if (students.length > 0) {
      const sumRow = students.length + 4
      ws.mergeCells(sumRow, 1, sumRow, COL_DEFS.length)
      const sc = ws.getCell(sumRow, 1)
      sc.value = `جمع کل نوآموزان: ${students.length} نفر`
      sc.font = { bold: true, size: 11, color: { argb: COLOR.white }, name: 'Calibri' }
      sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.title } }
      sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
      ws.getRow(sumRow).height = 24
    }

    // ════════════════════════════════════════════════════════════
    // ورق ۲: خلاصه مالی
    // ════════════════════════════════════════════════════════════
    const wsF = wb.addWorksheet('خلاصه مالی', { views: [{ rightToLeft: true }] })
    wsF.mergeCells('A1:F1')
    const fTitle = wsF.getCell('A1')
    fTitle.value = 'خلاصه وضعیت مالی نوآموزان — کودکستان برترین اندیشه'
    fTitle.font = { bold: true, size: 13, color: { argb: COLOR.white }, name: 'Calibri' }
    fTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.finance } }
    fTitle.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
    wsF.getRow(1).height = 32

    const fHeaders = ['#', 'نام', 'نام خانوادگی', 'کد ملی', 'مبلغ کل شهریه (ریال)', 'مجموع پرداخت‌شده (ریال)', 'مانده (ریال)', 'وضعیت']
    const fWidths = [6, 14, 16, 14, 22, 22, 20, 16]
    fHeaders.forEach((h, i) => {
      headerCell(wsF, 2, i + 1, h, COLOR.finance)
      wsF.getColumn(i + 1).width = fWidths[i]
    })
    wsF.getRow(2).height = 24
    wsF.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: fHeaders.length } }

    students.forEach((s, i) => {
      const rowNum = i + 3
      const isEven = i % 2 === 0
      const paid = s.manualPayments.reduce((sum, m) => sum + m.amountPaid, 0)
      const remaining = yearTuition ? yearTuition - paid : null
      const vals = [
        i + 1,
        s.firstName, s.lastName, s.nationalId,
        yearTuition ? yearTuition.toLocaleString('en-US') : '—',
        paid > 0 ? paid.toLocaleString('en-US') : '۰',
        remaining === null ? '—' : remaining <= 0 ? 'تسویه‌شده' : remaining.toLocaleString('en-US'),
        yearTuition ? 'تعریف شده' : 'تعریف نشده',
      ]
      vals.forEach((v, j) => {
        const c = wsF.getCell(rowNum, j + 1)
        c.value = v
        c.font = { size: 10, name: 'Calibri', bold: j === 0 }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? COLOR.rowA : COLOR.rowB } }
        c.alignment = { horizontal: j === 0 ? 'center' : 'right', vertical: 'middle', readingOrder: 'rightToLeft' }
        c.border = { top: thin, bottom: thin, left: thin, right: thin }
        if (j === 7 && !yearTuition) c.font = { ...c.font, color: { argb: 'FFCC7700' }, bold: true }
        if (j === 6 && remaining !== null && remaining <= 0) c.font = { ...c.font, color: { argb: 'FF2E7D32' }, bold: true }
        if (j === 6 && remaining !== null && remaining > 0) c.font = { ...c.font, color: { argb: 'FFC62828' }, bold: true }
      })
      wsF.getRow(rowNum).height = 20
    })

    // ردیف جمع کل در ورق مالی
    if (students.length > 0) {
      const fSumRow = students.length + 3
      const totalAllPaid = students.reduce((sum, s) => sum + s.manualPayments.reduce((a, m) => a + m.amountPaid, 0), 0)
      wsF.mergeCells(fSumRow, 1, fSumRow, 4)
      const fsc = wsF.getCell(fSumRow, 1)
      fsc.value = `جمع کل ${students.length} نوآموز`
      fsc.font = { bold: true, size: 11, color: { argb: COLOR.white }, name: 'Calibri' }
      fsc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.finance } }
      fsc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
      const fsc2 = wsF.getCell(fSumRow, 6)
      fsc2.value = totalAllPaid.toLocaleString('en-US')
      fsc2.font = { bold: true, size: 11, color: { argb: COLOR.white }, name: 'Calibri' }
      fsc2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.finance } }
      fsc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rightToLeft' }
      wsF.getRow(fSumRow).height = 24
    }

    const buf = await wb.xlsx.writeBuffer()
    const today = new Date().toISOString().slice(0, 10)
    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="students-${today}.xlsx"`,
      },
    })
  } catch (error) {
    return jsonError(error, 'خطا در تولید اکسل')
  }
}
