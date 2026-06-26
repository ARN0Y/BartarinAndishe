'use client'

import { formatJalaliDateTime } from '@/lib/jalali'

export default function InvoicePrintFooter() {
  return (
    <div className="invoice-print-footer">
      <p>
        تاریخ چاپ: <span className="ltr inline-block">{formatJalaliDateTime(new Date())}</span>
      </p>
    </div>
  )
}
