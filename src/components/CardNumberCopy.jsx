'use client'

import { useState } from 'react'
import { Copy, Check, CreditCard } from 'lucide-react'
import { managerCard } from '@/data/siteContact'

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
function toFa(value) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)])
}

/** کارت پرداخت دستی با دکمهٔ کپی شماره کارت مدیر در حافظهٔ موقت */
export default function CardNumberCopy({ className = '' }) {
  const [copied, setCopied] = useState(false)
  const grouped = managerCard.number.replace(/(\d{4})(?=\d)/g, '$1-')

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(managerCard.number)
      } else {
        const ta = document.createElement('textarea')
        ta.value = managerCard.number
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* مرورگرهای قدیمی */
    }
  }

  return (
    <div className={`no-print rounded-lg border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/20 ${className}`}>
      <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
        <CreditCard className="h-4 w-4" strokeWidth={1.8} />
        <p className="text-sm font-bold">پرداخت کارت‌به‌کارت</p>
      </div>
      <p className="mt-1 text-xs text-sky-800/80 dark:text-sky-200/70">
        مبلغ را به شماره‌کارت زیر واریز و سپس رسید را برای مدیریت ارسال کنید.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-200 bg-white px-4 py-3 dark:border-sky-900/60 dark:bg-slate-900">
        <div className="min-w-0">
          <p className="ltr text-right font-mono text-lg font-extrabold tracking-wider text-foreground">
            {toFa(grouped)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {managerCard.holder} — {managerCard.bank}
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-sm transition ${
            copied ? 'bg-emerald-600' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'کپی شد' : 'کپی شماره کارت'}
        </button>
      </div>
    </div>
  )
}
