import { jalaliToDate } from '@/lib/jalali'
import { CHECK_KINDS } from '@/lib/services/financialPlanService'

function parseDueParts(jalaliDate) {
  const parts = String(jalaliDate || '').split('/')
  if (parts.length !== 3) throw new Error('تاریخ نامعتبر در برنامه مالی قرارداد.')
  return { dueYear: parseInt(parts[0], 10), dueMonth: parseInt(parts[1], 10) }
}

/**
 * پس از امضای قرارداد توسط والد، ردیف‌های نقدی و چک را به فاکتور منتقل می‌کند.
 * — نقدی: پرداخت ثبت‌شده (ManualPayment)
 * — چک سرحساب: قسط در انتظار (PaymentSchedule)
 * — چک امانت (وثیقه): فقط توضیح در بالای فاکتور — در اقساط نیست
 * — پرداخت‌های نقدی برنامه چک امانت: قسط در انتظار
 */
export async function syncFinancialPlanToInvoice(tx, studentId, financialPlan) {
  if (!financialPlan || financialPlan.invoicedAt) return { synced: false }

  const student = await tx.student.findUnique({ where: { id: studentId } })
  if (!student) throw new Error('نوآموز یافت نشد.')

  const lines = financialPlan.lines || []
  const academicYear = student.academicYear

  for (const line of lines) {
    if (line.lineType === 'cash') {
      await tx.manualPayment.create({
        data: {
          studentId,
          academicYear,
          amountPaid: line.amount,
          paymentDate: jalaliToDate(line.paymentDate),
          description: line.description?.trim() || 'بیعانه شهریه — ثبت از قرارداد',
        },
      })
      continue
    }

    if (line.lineType === 'check') {
      const { dueYear, dueMonth } = parseDueParts(line.paymentDate)
      const kindLabel = line.checkKind ? CHECK_KINDS[line.checkKind]?.label : 'چک'
      const descParts = [kindLabel]
      if (line.description?.trim()) descParts.push(line.description.trim())
      descParts.push('ثبت از قرارداد')

      // چک امانت (وثیقه) در اقساط نیست — فقط پرداخت‌های نقدی برنامه امانت قسط می‌شوند
      if (line.checkKind !== 'amanat') {
        await tx.paymentSchedule.create({
          data: {
            studentId,
            academicYear,
            amountDue: line.amount,
            dueDate: line.paymentDate,
            dueYear,
            dueMonth,
            description: descParts.join(' — '),
            checkNumber: line.checkNumber || null,
            checkDate: line.paymentDate,
            bankName: line.bankName || null,
            bankBranch: line.bankBranch || null,
            checkOwner: line.checkOwner || null,
            sayadiNumber: line.sayadiNumber || null,
            isPaid: false,
          },
        })
      }

      if (line.checkKind === 'amanat') {
        for (const row of line.amanatCashRows || []) {
          const parts = parseDueParts(row.paymentDate)
          await tx.paymentSchedule.create({
            data: {
              studentId,
              academicYear,
              amountDue: row.amount,
              dueDate: row.paymentDate,
              dueYear: parts.dueYear,
              dueMonth: parts.dueMonth,
              description: 'پرداخت نقدی چک امانت — ثبت از قرارداد',
              checkDate: row.paymentDate,
              isPaid: false,
            },
          })
        }
      }
    }
  }

  await tx.studentFinancialPlan.update({
    where: { id: financialPlan.id },
    data: { invoicedAt: new Date() },
  })

  return { synced: true }
}
