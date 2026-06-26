'use client'

import { formatAcademicYearDisplay } from '@/lib/academicYear'

export default function InvoicePrintHeader({ invoice }) {
  const yearLabel = invoice.academicYear ? formatAcademicYearDisplay(invoice.academicYear) : null

  return (
    <div className="invoice-print-header">
      <div className="relative z-[1] border-b border-pink/20 bg-gradient-to-l from-pink-deep to-rose px-6 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.svg"
              alt="لوگوی کودکستان برترین اندیشه"
              className="invoice-print-logo h-14 w-auto shrink-0 rounded-xl bg-white/95 p-1.5"
            />
            <div>
              <p className="text-xs font-semibold text-white/90">کودکستان برترین اندیشه</p>
              <h2 className="text-lg font-extrabold">فاکتور پرداختی</h2>
            </div>
          </div>
          <div className="text-left text-xs text-white/85">
            {yearLabel ? (
              <p>سال تحصیلی: <span className="font-bold">{yearLabel}</span></p>
            ) : null}
            {invoice.gradeLevel ? (
              <p className="mt-1">پایه: <span className="font-bold">{invoice.gradeLevel}</span></p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/90">
          <p>نام نوآموز: <span className="font-bold text-white">{invoice.fullName}</span></p>
          {invoice.studentCode ? (
            <p>کد نوآموز: <span className="ltr font-bold text-white">{invoice.studentCode}</span></p>
          ) : null}
          {invoice.nationalId ? (
            <p>کد ملی: <span className="ltr font-bold text-white">{invoice.nationalId}</span></p>
          ) : null}
        </div>

        {(invoice.amanatCollateralNotes || []).length > 0 ? (
          <div className="mt-4 space-y-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs leading-6 text-white/95">
            <p className="font-bold text-white">توضیحات چک امانت</p>
            {invoice.amanatCollateralNotes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
