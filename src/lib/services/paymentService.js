import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import { getActiveAcademicYear } from '@/lib/academicYear'
import {
  formatCurrency,
  formatDate,
  fullName,
  paymentStatusLabel,
  registrationStatusLabel,
} from '@/lib/formatters'
import { AppError } from '@/lib/errors'
import { requestPayment, verifyPayment } from '@/lib/payments/zarinpal'
import { randomUUID } from 'crypto'

function sumSuccessful(payments) {
  return payments
    .filter((p) => p.status === 'Success')
    .reduce((sum, p) => sum + p.amountPaid, 0)
}

export async function getAdminFinancialDashboard(academicYear) {
  const year = academicYear || await getActiveAcademicYear()

  const students = await prisma.student.findMany({
    where: { registrationStatus: 'Confirmed', academicYear: year },
    include: {
      payments: { where: { academicYear: year }, orderBy: { paymentDate: 'desc' } },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  return {
    academicYear: year,
    students: students.map((s) => {
      const total = sumSuccessful(s.payments)
      return {
        id: s.id,
        fullName: fullName(s),
        nationalId: s.nationalId,
        registrationStatus: s.registrationStatus,
        registrationStatusLabel: registrationStatusLabel(s.registrationStatus),
        totalPaidCurrentYear: total,
        totalPaidFormatted: formatCurrency(total),
        paymentsCount: s.payments.length,
      }
    }),
  }
}

export async function getParentFinancialDashboard(studentId) {
  const academicYear = await getActiveAcademicYear()

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      payments: { where: { academicYear }, orderBy: { paymentDate: 'desc' } },
    },
  })

  if (!student) {
    throw new AppError(404, 'اطلاعات نوآموز یافت نشد.')
  }

  const total = sumSuccessful(student.payments)

  return {
    academicYear,
    student: {
      id: student.id,
      fullName: fullName(student),
      nationalId: student.nationalId,
      registrationStatus: student.registrationStatus,
      registrationStatusLabel: registrationStatusLabel(student.registrationStatus),
    },
    totalPaidCurrentYear: total,
    totalPaidFormatted: formatCurrency(total),
    transactions: student.payments.map((p) => ({
      id: p.id,
      paymentDate: p.paymentDate,
      paymentDateFormatted: formatDate(p.paymentDate),
      amountPaid: p.amountPaid,
      amountPaidFormatted: formatCurrency(p.amountPaid),
      trackingId: p.trackingId,
      status: p.status,
      statusLabel: paymentStatusLabel(p.status),
      description: p.description,
    })),
  }
}

export async function startZarinpalPayment(studentId, amount) {
  if (!amount || amount < 1000) {
    throw new AppError(400, 'حداقل مبلغ پرداخت ۱۰۰۰ ریال است.')
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) {
    throw new AppError(404, 'نوآموز یافت نشد.')
  }

  const trackingId = `ZP-${Date.now()}-${randomUUID().slice(0, 8)}`
  const callbackUrl = `${config.appUrl}/api/payments/zarinpal/verify`
  const academicYear = await getActiveAcademicYear()

  const payment = await prisma.payment.create({
    data: {
      studentId,
      amountPaid: amount,
      academicYear,
      trackingId,
      status: 'Pending',
      description: 'پرداخت شهریه آنلاین',
    },
  })

  const { authority, paymentUrl } = await requestPayment({
    amount,
    description: `شهریه ${fullName(student)} — کودکستان برترین اندیشه`,
    callbackUrl,
    metadata: { studentId, paymentId: payment.id },
  })

  await prisma.payment.update({
    where: { id: payment.id },
    data: { zarinpalAuthority: authority },
  })

  return { paymentUrl, authority, paymentId: payment.id }
}

export async function completeZarinpalPayment(authority, statusParam) {
  const payment = await prisma.payment.findUnique({
    where: { zarinpalAuthority: authority },
    include: { student: true },
  })

  if (!payment) {
    throw new AppError(404, 'تراکنش یافت نشد.')
  }

  if (payment.status !== 'Pending') {
    return { success: payment.status === 'Success', payment }
  }

  if (statusParam !== 'OK' && statusParam !== 'OK?') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'Failed' },
    })
    return { success: false, payment }
  }

  const verification = await verifyPayment({
    amount: payment.amountPaid,
    authority,
  })

  if (!verification.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'Failed' },
    })
    return { success: false, payment }
  }

  const updated = await prisma.payment.updateMany({
    where: { id: payment.id, status: 'Pending' },
    data: {
      status: 'Success',
      zarinpalRefId: verification.refId,
      paymentDate: new Date(),
    },
  })

  if (updated.count === 0) {
    const current = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: { student: true },
    })
    return { success: current.status === 'Success', payment: current }
  }

  const finalPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: { student: true },
  })

  return { success: true, payment: finalPayment, refId: verification.refId }
}
