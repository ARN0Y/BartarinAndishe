'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import AmountRialHint from '@/components/admin/AmountRialHint'
import { normalizeSayadiNumber, validateSayadiNumber } from '@/lib/sayadiNumber'
import {
  AdminPanel,
  AdminButton,
  AdminBadge,
  inputCls,
  labelCls,
} from '@/components/admin/ui/AdminUI'

function formatThousands(val) {
  const digits = String(val || '').replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

function createEmptyAmanatRows() {
  return [{ paymentDate: '', amount: '' }]
}

const INSTALLMENT_ORDINALS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم']

function defaultCheckDescription(existingCheckCount) {
  const label = INSTALLMENT_ORDINALS[existingCheckCount] || String(existingCheckCount + 1)
  return `قسط ${label}`
}

function getFirstCheckBankDefaults(lines = []) {
  const firstCheck = lines.find((l) => l.lineType === 'check')
  if (!firstCheck) return { bankName: '', bankBranch: '', checkOwner: '' }
  return {
    bankName: firstCheck.bankName || '',
    bankBranch: firstCheck.bankBranch || '',
    checkOwner: firstCheck.checkOwner || '',
  }
}

function createEmptyCheckForm(lines = []) {
  const checkCount = lines.filter((l) => l.lineType === 'check').length
  const bankDefaults = getFirstCheckBankDefaults(lines)
  return {
    lineType: 'check',
    amount: '',
    paymentDate: '',
    description: defaultCheckDescription(checkCount),
    checkNumber: '',
    bankName: bankDefaults.bankName,
    bankBranch: bankDefaults.bankBranch,
    checkOwner: bankDefaults.checkOwner,
    sayadiNumber: '',
    checkKind: 'sarhesab',
    amanatCashRows: createEmptyAmanatRows(),
  }
}

const EMPTY_CASH = { lineType: 'cash', amount: '', paymentDate: '', description: 'بیعانه شهریه' }

export default function AdminFinancialPlanPanel({ studentId, studentName, onUpdated }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [lineType, setLineType] = useState('cash')
  const [lineForm, setLineForm] = useState(EMPTY_CASH)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/students/${studentId}/financial-plan`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در بارگذاری')
      setPlan(json.plan)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    load()
  }, [load])

  const isLocked = plan?.readyForParent
  const isAmanatCheck = lineType === 'check' && lineForm.checkKind === 'amanat'

  function resetLineForm(type = 'cash') {
    setLineType(type)
    setLineForm(type === 'check' ? createEmptyCheckForm(plan?.lines) : { ...EMPTY_CASH })
  }

  function validateCheckForm(base) {
    if (!base.checkNumber) return 'شماره چک الزامی است.'
    if (!base.paymentDate) return 'تاریخ چک الزامی است.'
    if (!base.bankName) return 'نام بانک الزامی است.'
    if (!base.bankBranch) return 'شعبه بانک الزامی است.'
    if (!base.checkOwner) return 'صاحب چک الزامی است.'
    const sayadiErr = validateSayadiNumber(base.sayadiNumber)
    if (sayadiErr) return sayadiErr
    if (base.checkKind === 'amanat') {
      const rows = base.amanatCashRows || []
      if (!rows.length) return 'حداقل یک ردیف پرداخت نقدی برای چک امانت لازم است.'
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (!row?.paymentDate) return `تاریخ ردیف ${i + 1} پرداخت نقدی امانت الزامی است.`
        if (!row?.amount) return `مبلغ ردیف ${i + 1} پرداخت نقدی امانت الزامی است.`
      }
    }
    return null
  }

  function addLineToDraft() {
    const base = lineType === 'check'
      ? { ...createEmptyCheckForm(plan?.lines), ...lineForm }
      : { ...EMPTY_CASH, ...lineForm }
    const amount = Number(String(base.amount).replace(/\D/g, ''))
    if (!amount || !base.paymentDate) {
      setError('مبلغ و تاریخ هر ردیف الزامی است.')
      return
    }

    if (lineType === 'check') {
      const checkError = validateCheckForm(base)
      if (checkError) {
        setError(checkError)
        return
      }
    }

    const amanatCashRows = base.checkKind === 'amanat'
      ? (base.amanatCashRows || []).map((row) => ({
          paymentDate: row.paymentDate,
          amount: Number(String(row.amount).replace(/\D/g, '')),
        }))
      : []

    const newLine = {
      id: `draft-${Date.now()}`,
      lineType,
      amount,
      paymentDate: base.paymentDate,
      description: base.description || '',
      checkNumber: lineType === 'check' ? base.checkNumber : '',
      bankName: lineType === 'check' ? base.bankName : '',
      bankBranch: lineType === 'check' ? base.bankBranch : '',
      checkOwner: lineType === 'check' ? base.checkOwner : '',
      sayadiNumber: lineType === 'check' ? normalizeSayadiNumber(base.sayadiNumber) : '',
      checkKind: lineType === 'check' ? base.checkKind : null,
      amanatCashRows,
      lineTypeLabel: lineType === 'cash' ? 'نقدی' : 'چک',
      checkKindLabel: lineType === 'check'
        ? (base.checkKind === 'sarhesab' ? 'سرحساب' : 'امانت')
        : null,
      amountFormatted: new Intl.NumberFormat('fa-IR').format(amount),
    }

    const nextLines = [...(plan?.lines || []), newLine]
    setPlan((prev) => ({
      ...prev,
      lines: nextLines,
    }))
    if (lineType === 'check') {
      setLineForm(createEmptyCheckForm(nextLines))
    } else {
      resetLineForm('cash')
    }
    setError('')
  }

  function removeLine(index) {
    setPlan((prev) => ({
      ...prev,
      lines: (prev?.lines || []).filter((_, i) => i !== index),
    }))
  }

  function updateAmanatRow(index, field, value) {
    setLineForm((prev) => {
      const rows = [...(prev.amanatCashRows || createEmptyAmanatRows())]
      rows[index] = {
        ...rows[index],
        [field]: field === 'amount' ? value.replace(/\D/g, '') : value,
      }
      return { ...prev, amanatCashRows: rows }
    })
  }

  function addAmanatRow() {
    setLineForm((prev) => ({
      ...prev,
      amanatCashRows: [...(prev.amanatCashRows || createEmptyAmanatRows()), { paymentDate: '', amount: '' }],
    }))
  }

  function removeAmanatRow(index) {
    setLineForm((prev) => {
      const rows = [...(prev.amanatCashRows || createEmptyAmanatRows())]
      if (rows.length <= 1) return prev
      return { ...prev, amanatCashRows: rows.filter((_, i) => i !== index) }
    })
  }

  async function savePlan() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        lines: (plan?.lines || []).map((line) => ({
          lineType: line.lineType,
          amount: line.amount,
          paymentDate: line.paymentDate,
          description: line.description,
          checkNumber: line.checkNumber,
          bankName: line.bankName,
          bankBranch: line.bankBranch,
          checkOwner: line.checkOwner,
          sayadiNumber: line.sayadiNumber,
          checkKind: line.checkKind,
          amanatCashRows: line.amanatCashRows || [],
        })),
      }
      const res = await fetch(`/api/admin/students/${studentId}/financial-plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در ذخیره')
      setPlan(json.plan)
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function runAction(action) {
    setActionLoading(true)
    setError('')
    try {
      if (action === 'ready') {
        await savePlan()
      }
      const res = await fetch(`/api/admin/students/${studentId}/financial-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setPlan(json.plan)
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const amanatLinesInPlan = useMemo(
    () => (plan?.lines || []).filter((l) => l.lineType === 'check' && l.checkKind === 'amanat'),
    [plan],
  )

  if (loading) {
    return (
      <AdminPanel>
        <p className="text-sm text-slate-400">در حال بارگذاری قرارداد مالی...</p>
      </AdminPanel>
    )
  }

  return (
    <AdminPanel noPadding>
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">قرارداد مالی (نقدی و چک)</h3>
            <p className="mt-1 text-xs text-slate-500">برای {studentName}</p>
          </div>
          {plan?.readyForParent ? (
            <AdminBadge variant="success">آماده برای امضای والدین</AdminBadge>
          ) : (
            <AdminBadge variant="warning">پیش‌نویس</AdminBadge>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {(plan?.lines || []).length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] text-sm text-right">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-600">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">نوع</th>
                  <th className="px-3 py-2">تاریخ</th>
                  <th className="px-3 py-2">مبلغ (ریال)</th>
                  <th className="px-3 py-2">شماره چک</th>
                  <th className="px-3 py-2">نوع چک</th>
                  <th className="px-3 py-2">توضیح</th>
                  {!isLocked ? <th className="px-3 py-2 w-16" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(plan?.lines || []).map((line, idx) => (
                  <tr key={line.id || idx} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 font-semibold">{line.lineTypeLabel || (line.lineType === 'cash' ? 'نقدی' : 'چک')}</td>
                    <td className="px-3 py-2 ltr text-right">{line.paymentDate}</td>
                    <td className="px-3 py-2 font-bold">{line.amountFormatted || formatThousands(line.amount)}</td>
                    <td className="px-3 py-2 ltr text-right">{line.checkNumber || '—'}</td>
                    <td className="px-3 py-2">{line.checkKindLabel || '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{line.description || '—'}</td>
                    {!isLocked ? (
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-xs font-bold text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            هنوز ردیفی برای قرارداد مالی ثبت نشده است.
          </p>
        )}

        {amanatLinesInPlan.length > 0 ? (
          <div className="space-y-3">
            {amanatLinesInPlan.map((line) => (
              <div key={line.id} className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                <p className="text-xs font-bold text-amber-900">
                  برنامه پرداخت نقدی چک امانت {line.checkNumber ? `(شماره ${line.checkNumber})` : ''}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {(line.amanatCashRows || []).map((row, i) => (
                    <div key={i} className="rounded-md border border-amber-200 bg-white px-3 py-2 text-xs">
                      <p className="font-bold text-slate-700">ردیف {i + 1}</p>
                      <p className="mt-1 ltr text-right text-slate-600">{row.paymentDate}</p>
                      <p className="font-bold text-slate-900">{row.amountFormatted || formatThousands(row.amount)} ریال</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLocked ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="mb-4 flex rounded-lg border border-slate-200 overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => resetLineForm('cash')}
                  className={`px-4 py-2 text-xs font-bold ${lineType === 'cash' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                >
                  افزودن نقدی (بیعانه)
                </button>
                <button
                  type="button"
                  onClick={() => resetLineForm('check')}
                  className={`px-4 py-2 text-xs font-bold border-r border-slate-200 ${lineType === 'check' ? 'bg-violet-700 text-white' : 'bg-white text-slate-600'}`}
                >
                  افزودن چک
                </button>
              </div>

              {lineType === 'cash' ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>مبلغ (ریال)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatThousands(lineForm.amount)}
                      onChange={(e) => setLineForm((v) => ({ ...v, amount: e.target.value.replace(/\D/g, '') }))}
                      className={`${inputCls} ltr`}
                      placeholder="50,000,000"
                    />
                    {lineForm.amount ? <AmountRialHint rial={lineForm.amount} className="mt-1 text-xs text-slate-500" /> : null}
                  </div>
                  <div>
                    <label className={labelCls}>تاریخ دریافت</label>
                    <JalaliDatePicker
                      value={lineForm.paymentDate}
                      onChange={(v) => setLineForm((f) => ({ ...f, paymentDate: v }))}
                      yearStart={1404}
                      yearEnd={1410}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>توضیح (مثلاً بیعانه)</label>
                    <input
                      value={lineForm.description}
                      onChange={(e) => setLineForm((v) => ({ ...v, description: e.target.value }))}
                      className={inputCls}
                      placeholder="بیعانه شهریه"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={labelCls}>شماره چک <span className="text-red-500">*</span></label>
                      <input
                        value={lineForm.checkNumber}
                        onChange={(e) => setLineForm((v) => ({ ...v, checkNumber: e.target.value }))}
                        className={`${inputCls} ltr`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>تاریخ چک <span className="text-red-500">*</span></label>
                      <JalaliDatePicker
                        value={lineForm.paymentDate}
                        onChange={(v) => setLineForm((f) => ({ ...f, paymentDate: v }))}
                        yearStart={1404}
                        yearEnd={1410}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>مبلغ چک (ریال) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatThousands(lineForm.amount)}
                        onChange={(e) => setLineForm((v) => ({ ...v, amount: e.target.value.replace(/\D/g, '') }))}
                        className={`${inputCls} ltr`}
                      />
                      {lineForm.amount ? <AmountRialHint rial={lineForm.amount} className="mt-1 text-xs text-slate-500" /> : null}
                    </div>
                    <div>
                      <label className={labelCls}>نوع چک <span className="text-red-500">*</span></label>
                      <select
                        value={lineForm.checkKind}
                        onChange={(e) => {
                          const kind = e.target.value
                          setLineForm((v) => ({
                            ...v,
                            checkKind: kind,
                            amanatCashRows: kind === 'amanat' ? createEmptyAmanatRows() : [],
                          }))
                        }}
                        className={inputCls}
                      >
                        <option value="sarhesab">سرحساب</option>
                        <option value="amanat">امانت</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={labelCls}>نام بانک <span className="text-red-500">*</span></label>
                      <input value={lineForm.bankName} onChange={(e) => setLineForm((v) => ({ ...v, bankName: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>شعبه <span className="text-red-500">*</span></label>
                      <input value={lineForm.bankBranch} onChange={(e) => setLineForm((v) => ({ ...v, bankBranch: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>صاحب چک <span className="text-red-500">*</span></label>
                      <input value={lineForm.checkOwner} onChange={(e) => setLineForm((v) => ({ ...v, checkOwner: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>شناسه صیادی (۱۶ رقم) <span className="text-red-500">*</span></label>
                      <input
                        value={lineForm.sayadiNumber}
                        onChange={(e) => setLineForm((v) => ({ ...v, sayadiNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                        className={`${inputCls} ltr`}
                        inputMode="numeric"
                        maxLength={16}
                        placeholder="۱۶ رقم"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>توضیح</label>
                    <input value={lineForm.description} onChange={(e) => setLineForm((v) => ({ ...v, description: e.target.value }))} className={inputCls} placeholder="قسط اول" />
                  </div>

                  {isAmanatCheck ? (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-amber-900">برنامه پرداخت نقدی چک امانت</p>
                        <AdminButton type="button" variant="secondary" onClick={addAmanatRow}>
                          + افزودن ردیف
                        </AdminButton>
                      </div>
                      <p className="mt-1 text-xs text-amber-800">
                        در هر ردیف تاریخ و مبلغی که والدین باید نقدی پرداخت کنند را مشخص کنید (در پایین قرارداد چاپ می‌شود).
                      </p>
                      <div className="mt-4 space-y-3">
                        {(lineForm.amanatCashRows || createEmptyAmanatRows()).map((row, idx) => (
                          <div key={idx} className="grid gap-3 rounded-lg border border-amber-200 bg-white p-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
                            <p className="text-xs font-bold text-amber-900 pt-2">ردیف {idx + 1}</p>
                            <div>
                              <label className={labelCls}>تاریخ پرداخت</label>
                              <JalaliDatePicker
                                value={row.paymentDate}
                                onChange={(v) => updateAmanatRow(idx, 'paymentDate', v)}
                                yearStart={1404}
                                yearEnd={1410}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>مبلغ (ریال)</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={formatThousands(row.amount)}
                                onChange={(e) => updateAmanatRow(idx, 'amount', e.target.value)}
                                className={`${inputCls} ltr`}
                              />
                              {row.amount ? <AmountRialHint rial={row.amount} className="mt-1 text-xs text-amber-800" /> : null}
                            </div>
                            {(lineForm.amanatCashRows || []).length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeAmanatRow(idx)}
                                className="pb-2 text-xs font-bold text-red-600 hover:text-red-800"
                              >
                                حذف
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <AdminButton type="button" variant="secondary" className="mt-4" onClick={addLineToDraft}>
                افزودن به لیست قرارداد
              </AdminButton>
            </div>

            <div className="flex flex-wrap gap-3">
              <AdminButton type="button" disabled={saving} onClick={savePlan}>
                {saving ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
              </AdminButton>
              <AdminButton
                type="button"
                variant="primary"
                disabled={actionLoading || !(plan?.lines || []).length}
                onClick={() => runAction('ready')}
              >
                {actionLoading ? 'در حال ارسال...' : 'تکمیل و ارسال برای امضای والدین'}
              </AdminButton>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>قرارداد مالی تکمیل شده — والدین می‌توانند در پنل خود قرارداد را ببینند و امضا کنند.</span>
            <AdminButton type="button" variant="secondary" disabled={actionLoading} onClick={() => runAction('reopen')}>
              {actionLoading ? '...' : 'بازگشایی برای ویرایش'}
            </AdminButton>
          </div>
        )}
      </div>
    </AdminPanel>
  )
}
