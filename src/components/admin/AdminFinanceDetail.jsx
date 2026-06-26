'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import { rialToTomanWords } from '@/lib/numberToWords'
import { normalizeSayadiNumber, validateSayadiNumber } from '@/lib/sayadiNumber'
import {
  AdminPageHeader,
  AdminPanel,
  AdminButton,
  AdminBadge,
  AdminTable,
  inputCls,
  labelCls,
} from '@/components/admin/ui/AdminUI'
import PrintInvoiceButton from '@/components/ui/PrintInvoiceButton'
import InvoicePrintHeader from '@/components/ui/InvoicePrintHeader'
import InvoicePrintWatermark from '@/components/ui/InvoicePrintWatermark'
import InvoicePrintFooter from '@/components/ui/InvoicePrintFooter'
import AdminFinancialPlanPanel from '@/components/admin/AdminFinancialPlanPanel'
import { getInvoiceBalanceDisplay, formatBalanceToman } from '@/lib/invoiceBalance'
import {
  confirmDuplicateWarning,
  findDuplicateCashPayment,
  findDuplicateSchedule,
  patchFinanceWithDuplicateRetry,
} from '@/lib/financeDuplicates'
import { splitInvoiceSchedules } from '@/lib/invoiceSchedules'

function formatThousands(val) {
  const digits = String(val || '').replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

function validateJalali(str) {
  if (!str) return false
  const parts = str.split('/')
  if (parts.length !== 3) return false
  if (!parts[0] || !parts[1] || !parts[2]) return false
  const [y, m, d] = parts.map(Number)
  return y > 1300 && y < 1500 && m >= 1 && m <= 12 && d >= 1 && d <= 31
}

function formatToman(rial) {
  return `${new Intl.NumberFormat('fa-IR').format(Math.floor(rial / 10))} تومان`
}

export default function AdminFinanceDetail() {
  const params = useParams()
  const studentId = params?.studentId

  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingPayment, setEditingPayment] = useState(null)
  const [editPaySaving, setEditPaySaving] = useState(false)
  const [editingSched, setEditingSched] = useState(null)
  const [editSchedSaving, setEditSchedSaving] = useState(false)

  const loadStudent = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/students/${studentId}`)
      let json
      try {
        json = await res.json()
      } catch {
        if (res.status === 401 || res.status === 403) {
          setError('دسترسی نداری — لطفاً مجدداً وارد شوید.')
        } else {
          setError(`خطای سرور (${res.status}) — سرور را ری‌استارت کنید.`)
        }
        setStudent(null)
        return
      }
      if (!res.ok) {
        setError(json.message || 'خطا در دریافت اطلاعات')
        setStudent(null)
        return
      }
      setStudent(json.student)
    } catch (err) {
      setError('خطا در ارتباط با سرور — لطفاً سرور را ری‌استارت کنید.')
      setStudent(null)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    loadStudent()
  }, [loadStudent])

  async function deletePayment(paymentId) {
    if (!confirm('این پرداخت حذف شود؟')) return
    await fetch(`/api/admin/manual-payments/${paymentId}`, { method: 'DELETE' })
    loadStudent()
  }

  async function deleteSchedule(id) {
    if (!confirm('این قسط حذف شود؟')) return
    await fetch(`/api/admin/payment-schedules/${id}`, { method: 'DELETE' })
    loadStudent()
  }

  const { installments: installmentSchedules } = splitInvoiceSchedules(student?.schedules ?? [])
  const allPendingSchedules = installmentSchedules.filter((s) => !s.isPaid)
  const pendingSchedules = allPendingSchedules
  const totalPaidRial = student?.payments?.reduce((s, p) => s + p.amountPaid, 0) ?? 0
  const balanceDisplay = student ? getInvoiceBalanceDisplay(student.remaining) : null

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">در حال بارگذاری...</div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="جزئیات مالی"
          description={error || 'نوآموز یافت نشد.'}
          actions={
            <Link href="/admin/dashboard?tab=finance">
              <AdminButton variant="secondary">بازگشت</AdminButton>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
      <AdminPageHeader
        title={student.fullName}
        description={`کد ملی: ${student.nationalId}${student.studentCode ? ` — کد نوآموز: ${student.studentCode}` : ''}`}
        actions={
          <Link href="/admin/dashboard?tab=finance">
            <AdminButton variant="secondary">بازگشت به مدیریت مالی</AdminButton>
          </Link>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {/* خلاصه مالی */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminPanel>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">جمع پرداخت‌شده</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{formatToman(totalPaidRial)}</p>
          <p className="mt-1 text-xs text-slate-400">{student.totalFormatted} ریال</p>
        </AdminPanel>
        <AdminPanel>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">مبلغ کل شهریه</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {student.totalTuition ? formatToman(student.totalTuition) : '—'}
          </p>
        </AdminPanel>
        <AdminPanel>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {balanceDisplay?.label || 'مانده قابل پرداخت'}
          </p>
          <p className={`mt-2 text-lg font-bold ${
            !student.totalTuition ? 'text-slate-400'
            : balanceDisplay?.tone === 'settled' ? 'text-emerald-700'
            : balanceDisplay?.tone === 'credit' ? 'text-sky-700'
            : 'text-red-600'
          }`}>
            {!student.totalTuition
              ? '—'
              : balanceDisplay?.tone === 'settled'
                ? 'تسویه شده'
                : formatBalanceToman(balanceDisplay.displayRial)}
          </p>
        </AdminPanel>
      </div>

      <AdminPanel className="border border-slate-200 bg-slate-50/60">
        <p className="text-xs text-slate-600">
          پرداخت‌های نقدی و اقساط از «قرارداد مالی» پس از امضای والدین به فاکتور منتقل می‌شوند.
          در این بخش می‌توانید ردیف‌ها را مشاهده، ویرایش یا اقساط را تأیید کنید.
        </p>
      </AdminPanel>

      <AdminFinancialPlanPanel
        studentId={student.studentId}
        studentName={student.fullName}
      />

      <div className="no-print flex justify-end">
        <PrintInvoiceButton />
      </div>
      </div>

      <div id="invoice-print-root" className="relative space-y-6">
      <InvoicePrintWatermark />
      <AdminPanel noPadding>
        <InvoicePrintHeader invoice={student} />

        {student.payments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">هیچ پرداختی ثبت نشده است.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm text-right">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                    <th className="px-4 py-3 text-right w-8">#</th>
                    <th className="px-4 py-3 text-right">تاریخ پرداخت</th>
                    <th className="px-4 py-3 text-right">مبلغ</th>
                    <th className="px-4 py-3 text-right">شماره چک</th>
                    <th className="px-4 py-3 text-right">تاریخ چک</th>
                    <th className="px-4 py-3 text-right">نام بانک</th>
                    <th className="px-4 py-3 text-right">شعبه</th>
                    <th className="px-4 py-3 text-right">صاحب چک</th>
                    <th className="px-4 py-3 text-right">شماره صیادی</th>
                    <th className="px-4 py-3 text-right">توضیحات</th>
                    <th className="px-4 py-3 text-right w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.payments.map((p, idx) => (
                    <Fragment key={p.id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${p.description?.includes('قسط') ? 'bg-violet-50/40' : ''}`}>
                        <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap ltr text-right">{p.dateFormatted}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900 block">{p.amountFormatted}</span>
                          <span className="text-[10px] text-slate-400">{formatToman(p.amountPaid)}</span>
                        </td>
                        <td className="px-4 py-3 ltr text-right">
                          {p.checkNumber
                            ? <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{p.checkNumber}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 ltr text-right text-slate-600 whitespace-nowrap">{p.checkDate || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-slate-700">{p.bankName || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{p.bankBranch || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-slate-700">{p.checkOwner || <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 ltr text-right">
                          {p.sayadiNumber
                            ? <span className="font-mono text-xs text-slate-600">{p.sayadiNumber}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {p.description?.includes('قسط')
                            ? <span className="flex items-center gap-1"><AdminBadge variant="info">قسط</AdminBadge><span className="text-slate-400">{p.description}</span></span>
                            : (p.description || <span className="text-slate-300">—</span>)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <AdminButton
                              variant="secondary" size="sm" type="button"
                              onClick={() => {
                                if (editingPayment?.id === p.id) { setEditingPayment(null); return }
                                setEditingPayment({
                                  id: p.id,
                                  amountPaid: String(p.amountPaid),
                                  paymentDate: p.dateFormatted,
                                  description: p.description || '',
                                  checkNumber: p.checkNumber || '',
                                  checkDate: p.checkDate || '',
                                  bankName: p.bankName || '',
                                  bankBranch: p.bankBranch || '',
                                  checkOwner: p.checkOwner || '',
                                  sayadiNumber: p.sayadiNumber || '',
                                })
                              }}
                            >ویرایش</AdminButton>
                            <AdminButton variant="danger" size="sm" type="button" onClick={() => deletePayment(p.id)}>حذف</AdminButton>
                          </div>
                        </td>
                      </tr>
                      {editingPayment?.id === p.id ? (
                        <tr className="bg-slate-50">
                          <td colSpan={11} className="px-4 py-5">
                            <p className="mb-3 text-xs font-bold text-slate-700">ویرایش پرداخت</p>
                            <div className="grid items-end gap-3 sm:grid-cols-3 mb-3">
                              <div>
                                <label className={labelCls}>مبلغ (ریال)</label>
                                <input
                                  type="text" inputMode="numeric"
                                  value={formatThousands(editingPayment.amountPaid)}
                                  onChange={(e) => setEditingPayment((v) => ({ ...v, amountPaid: e.target.value.replace(/\D/g, '') }))}
                                  className={`${inputCls} ltr`}
                                />
                                {editingPayment.amountPaid ? <p className="mt-1 text-xs font-semibold text-slate-600">{rialToTomanWords(editingPayment.amountPaid)}</p> : null}
                              </div>
                              <div>
                                <label className={labelCls}>تاریخ پرداخت</label>
                                <JalaliDatePicker value={editingPayment.paymentDate} onChange={(v) => setEditingPayment((f) => ({ ...f, paymentDate: v }))} yearStart={1400} yearEnd={1410} />
                              </div>
                              <div>
                                <label className={labelCls}>توضیحات</label>
                                <input value={editingPayment.description} onChange={(e) => setEditingPayment((v) => ({ ...v, description: e.target.value }))} className={inputCls} />
                              </div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
                              <p className="mb-2 text-xs font-bold text-slate-600">اطلاعات چک</p>
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                  <label className={labelCls}>شماره چک</label>
                                  <input value={editingPayment.checkNumber} onChange={(e) => setEditingPayment((v) => ({ ...v, checkNumber: e.target.value }))} className={`${inputCls} ltr`} />
                                </div>
                                <div>
                                  <label className={labelCls}>تاریخ چک</label>
                                  <JalaliDatePicker value={editingPayment.checkDate} onChange={(v) => setEditingPayment((f) => ({ ...f, checkDate: v }))} yearStart={1404} yearEnd={1410} />
                                </div>
                                <div>
                                  <label className={labelCls}>نام بانک</label>
                                  <input value={editingPayment.bankName} onChange={(e) => setEditingPayment((v) => ({ ...v, bankName: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>شعبه بانک</label>
                                  <input value={editingPayment.bankBranch} onChange={(e) => setEditingPayment((v) => ({ ...v, bankBranch: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>صاحب چک</label>
                                  <input value={editingPayment.checkOwner} onChange={(e) => setEditingPayment((v) => ({ ...v, checkOwner: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                  <label className={labelCls}>شناسه صیادی (۱۶ رقم)</label>
                                  <input
                                    value={editingPayment.sayadiNumber}
                                    onChange={(e) => setEditingPayment((v) => ({ ...v, sayadiNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                                    className={`${inputCls} ltr`}
                                    inputMode="numeric"
                                    maxLength={16}
                                    placeholder="۱۶ رقم"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <AdminButton
                                size="sm" disabled={editPaySaving}
                                onClick={async () => {
                                  const dup = findDuplicateCashPayment(
                                    student.payments,
                                    editingPayment.paymentDate,
                                    editingPayment.amountPaid,
                                    editingPayment.id,
                                  )
                                  if (!confirmDuplicateWarning(dup, 'پرداخت نقدی')) return

                                  if (editingPayment.sayadiNumber) {
                                    const sayadiErr = validateSayadiNumber(editingPayment.sayadiNumber, { required: false })
                                    if (sayadiErr) {
                                      setError(sayadiErr)
                                      return
                                    }
                                  }

                                  setEditPaySaving(true)
                                  try {
                                    const body = {
                                      amountPaid: editingPayment.amountPaid,
                                      paymentDate: editingPayment.paymentDate,
                                      description: editingPayment.description,
                                      checkNumber: editingPayment.checkNumber,
                                      checkDate: editingPayment.checkDate,
                                      bankName: editingPayment.bankName,
                                      bankBranch: editingPayment.bankBranch,
                                      checkOwner: editingPayment.checkOwner,
                                      sayadiNumber: editingPayment.sayadiNumber
                                        ? normalizeSayadiNumber(editingPayment.sayadiNumber)
                                        : '',
                                    }
                                    const { ok, json, cancelled } = await patchFinanceWithDuplicateRetry(
                                      `/api/admin/manual-payments/${editingPayment.id}`,
                                      body,
                                      { date: editingPayment.paymentDate, amount: editingPayment.amountPaid },
                                      'پرداخت نقدی',
                                    )
                                    if (cancelled) return
                                    if (!ok) { setError(json.message); return }
                                    setEditingPayment(null)
                                    await loadStudent()
                                  } finally { setEditPaySaving(false) }
                                }}
                              >{editPaySaving ? 'ذخیره...' : 'ذخیره تغییرات'}</AdminButton>
                              <AdminButton variant="secondary" size="sm" onClick={() => setEditingPayment(null)}>انصراف</AdminButton>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm font-semibold text-slate-700">جمع پرداخت‌شده:</span>
                <span className="text-sm font-bold text-slate-900">{formatToman(totalPaidRial)}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm font-semibold text-slate-700">مبلغ کل شهریه:</span>
                {student.totalTuition ? (
                  <span className="text-sm font-bold text-slate-900">{formatToman(student.totalTuition)}</span>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </div>
              {student.totalTuition && balanceDisplay ? (
                <div className="flex items-center justify-between bg-white px-6 py-3">
                  <span className="text-sm font-bold text-slate-800">{balanceDisplay.label}:</span>
                  <span className={`text-lg font-bold ${
                    balanceDisplay.tone === 'settled' ? 'text-emerald-700'
                    : balanceDisplay.tone === 'credit' ? 'text-sky-700'
                    : 'text-red-600'
                  }`}>
                    {balanceDisplay.tone === 'settled'
                      ? 'تسویه شده'
                      : formatBalanceToman(balanceDisplay.displayRial)}
                  </span>
                </div>
              ) : null}
            </div>
          </>
        )}
      </AdminPanel>

      {/* اقساط در انتظار */}
      {allPendingSchedules.length > 0 ? (
        <AdminPanel noPadding>
          <div className="flex items-center justify-between border-b border-violet-200 bg-violet-700 px-6 py-3 text-white">
            <span className="text-sm font-bold">اقساط در انتظار پرداخت</span>
            <span className="text-xs text-violet-100">
              {pendingSchedules.length} قسط — مانده:{' '}
              {formatToman(pendingSchedules.reduce((a, s) => a + s.amountDue, 0))}
            </span>
          </div>

          {/* جدول قابل اسکرول افقی */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-right">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                  <th className="px-4 py-3 text-right">مبلغ</th>
                  <th className="px-4 py-3 text-right">شماره چک</th>
                  <th className="px-4 py-3 text-right">تاریخ چک</th>
                  <th className="px-4 py-3 text-right">نام بانک</th>
                  <th className="px-4 py-3 text-right">شعبه</th>
                  <th className="px-4 py-3 text-right">صاحب چک</th>
                  <th className="px-4 py-3 text-right">شماره صیادی</th>
                  <th className="px-4 py-3 text-right">توضیحات</th>
                  <th className="px-4 py-3 text-right w-36">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingSchedules.map((sc) => (
                  <Fragment key={sc.id}>
                    <tr className="bg-violet-50/40 hover:bg-violet-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {Number(sc.amountDue).toLocaleString('en-US')}
                        <span className="block text-[10px] font-normal text-slate-400">{formatToman(sc.amountDue)}</span>
                      </td>
                      <td className="px-4 py-3 ltr text-right">
                        {sc.checkNumber ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{sc.checkNumber}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 ltr text-right text-slate-600 whitespace-nowrap">{sc.checkDate || sc.dueDate || <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-slate-700">{sc.bankName || <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{sc.bankBranch || <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-slate-700">{sc.checkOwner || <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 ltr text-right">
                        {sc.sayadiNumber ? (
                          <span className="font-mono text-xs text-slate-600">{sc.sayadiNumber}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{sc.description || <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminButton
                            variant="success"
                            size="sm"
                            type="button"
                            onClick={async () => {
                              await fetch(`/api/admin/payment-schedules/${sc.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isPaid: true }),
                              })
                              await loadStudent()
                            }}
                          >
                            تأیید
                          </AdminButton>
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => {
                              if (editingSched?.id === sc.id) { setEditingSched(null); return }
                              setEditingSched({
                                id: sc.id,
                                amountDue: String(sc.amountDue),
                                description: sc.description || '',
                                checkNumber: sc.checkNumber || '',
                                checkDate: sc.checkDate || sc.dueDate || '',
                                bankName: sc.bankName || '',
                                bankBranch: sc.bankBranch || '',
                                checkOwner: sc.checkOwner || '',
                                sayadiNumber: sc.sayadiNumber || '',
                              })
                            }}
                          >
                            ویرایش
                          </AdminButton>
                          <AdminButton variant="danger" size="sm" type="button" onClick={() => deleteSchedule(sc.id)}>
                            حذف
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                    {editingSched?.id === sc.id ? (
                      <tr className="bg-slate-50">
                        <td colSpan={9} className="px-4 py-5">
                          <p className="mb-3 text-xs font-bold text-slate-700">ویرایش قسط</p>
                          <div className="grid gap-3 sm:grid-cols-2 mb-3">
                            <div>
                              <label className={labelCls}>مبلغ قسط (ریال)</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={formatThousands(editingSched.amountDue)}
                                onChange={(e) => setEditingSched((v) => ({ ...v, amountDue: e.target.value.replace(/\D/g, '') }))}
                                className={`${inputCls} ltr`}
                              />
                              {editingSched.amountDue ? (
                                <p className="mt-1 text-xs font-semibold text-slate-600">{rialToTomanWords(editingSched.amountDue)}</p>
                              ) : null}
                            </div>
                            <div>
                              <label className={labelCls}>توضیحات</label>
                              <input
                                value={editingSched.description}
                                onChange={(e) => setEditingSched((v) => ({ ...v, description: e.target.value }))}
                                className={inputCls}
                              />
                            </div>
                          </div>
                          {/* ردیف دوم: اطلاعات چک */}
                          <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 mb-3">
                            <p className="mb-2 text-xs font-bold text-violet-700">اطلاعات چک</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <label className={labelCls}>شماره چک</label>
                                <input value={editingSched.checkNumber} onChange={(e) => setEditingSched((v) => ({ ...v, checkNumber: e.target.value }))} className={`${inputCls} ltr`} />
                              </div>
                              <div>
                                <label className={labelCls}>تاریخ چک</label>
                                <JalaliDatePicker value={editingSched.checkDate} onChange={(v) => setEditingSched((f) => ({ ...f, checkDate: v }))} yearStart={1404} yearEnd={1410} />
                              </div>
                              <div>
                                <label className={labelCls}>نام بانک</label>
                                <input value={editingSched.bankName} onChange={(e) => setEditingSched((v) => ({ ...v, bankName: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>شعبه بانک</label>
                                <input value={editingSched.bankBranch} onChange={(e) => setEditingSched((v) => ({ ...v, bankBranch: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>صاحب چک</label>
                                <input value={editingSched.checkOwner} onChange={(e) => setEditingSched((v) => ({ ...v, checkOwner: e.target.value }))} className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>شناسه صیادی (۱۶ رقم)</label>
                                <input
                                  value={editingSched.sayadiNumber}
                                  onChange={(e) => setEditingSched((v) => ({ ...v, sayadiNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                                  className={`${inputCls} ltr`}
                                  inputMode="numeric"
                                  maxLength={16}
                                  placeholder="۱۶ رقم"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <AdminButton
                              size="sm"
                              disabled={editSchedSaving}
                              onClick={async () => {
                                const dup = findDuplicateSchedule(
                                  student.schedules,
                                  editingSched.checkDate,
                                  editingSched.amountDue,
                                  editingSched.id,
                                )
                                if (!confirmDuplicateWarning(dup, 'قسط')) return

                                if (editingSched.sayadiNumber) {
                                  const sayadiErr = validateSayadiNumber(editingSched.sayadiNumber, { required: false })
                                  if (sayadiErr) {
                                    setError(sayadiErr)
                                    return
                                  }
                                }

                                setEditSchedSaving(true)
                                try {
                                  const body = {
                                    amountDue: editingSched.amountDue,
                                    description: editingSched.description,
                                    checkNumber: editingSched.checkNumber,
                                    checkDate: editingSched.checkDate,
                                    bankName: editingSched.bankName,
                                    bankBranch: editingSched.bankBranch,
                                    checkOwner: editingSched.checkOwner,
                                    sayadiNumber: editingSched.sayadiNumber
                                      ? normalizeSayadiNumber(editingSched.sayadiNumber)
                                      : '',
                                  }
                                  const { ok, json, cancelled } = await patchFinanceWithDuplicateRetry(
                                    `/api/admin/payment-schedules/${editingSched.id}`,
                                    body,
                                    { date: editingSched.checkDate, amount: editingSched.amountDue },
                                    'قسط',
                                  )
                                  if (cancelled) return
                                  if (!ok) { setError(json.message); return }
                                  setEditingSched(null)
                                  await loadStudent()
                                } finally {
                                  setEditSchedSaving(false)
                                }
                              }}
                            >
                              {editSchedSaving ? 'ذخیره...' : 'ذخیره تغییرات'}
                            </AdminButton>
                            <AdminButton variant="secondary" size="sm" onClick={() => setEditingSched(null)}>
                              انصراف
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-violet-200 bg-violet-50 px-6 py-3 text-sm font-bold text-violet-800">
            جمع اقساط نمایش‌داده‌شده:{' '}
            <span className="text-violet-700">
              {rialToTomanWords(pendingSchedules.reduce((a, s) => a + s.amountDue, 0))}
            </span>
          </div>
        </AdminPanel>
      ) : null}
      <InvoicePrintFooter />
      </div>
    </div>
  )
}
