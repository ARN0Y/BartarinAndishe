'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import { CONTRACT_TOKENS } from '@/data/tuitionContractArticles'
import { Save, Plus, X, FileText, Info } from 'lucide-react'

const TOKEN_HELP = {
  'تاریخ': 'تاریخ قرارداد', 'مدیر': 'نام و سمت مدیر', 'ولی': 'جناب/سرکار + نام ولی امضاکننده',
  'ولی-کامل': 'نام کامل ولی', 'نوآموز': 'نام نوآموز', 'تلفن-منزل': 'تلفن منزل', 'موبایل': 'موبایل ولی',
  'آدرس': 'آدرس منزل', 'شهریه': 'مبلغ شهریه (ریال)', 'شهریه-حروف': 'شهریه به حروف', 'پایه': 'پایهٔ تحصیلی',
  'سال-تحصیلی': 'سال تحصیلی', 'مؤسس': 'نام مؤسس',
  'یونیفرم-پسر-از': 'قیمت فرم پسر (از)', 'یونیفرم-پسر-تا': 'قیمت فرم پسر (تا)',
  'یونیفرم-دختر-از': 'قیمت فرم دختر (از)', 'یونیفرم-دختر-تا': 'قیمت فرم دختر (تا)', 'کیف': 'قیمت کیف و جامدادی',
  'شماره-حساب': 'شماره حساب', 'بانک': 'نام بانک', 'صاحب-حساب': 'صاحب حساب', 'کدملی-حساب': 'کدملی صاحب حساب',
}

export default function AdminContractArticlesEditor() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [showTokens, setShowTokens] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contract-articles')
      const json = await res.json()
      setArticles(json.articles || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function addArticle() { setArticles((a) => [...a, { title: '', numbered: true, clauses: [''] }]) }
  function removeArticle(i) { if (window.confirm('این ماده حذف شود؟')) setArticles((a) => a.filter((_, idx) => idx !== i)) }
  function setTitle(i, v) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, title: v } : art)) }
  function setNumbered(i, v) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, numbered: v } : art)) }
  function setSignatures(i, v) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, signatures: v } : art)) }
  function addClause(i) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, clauses: [...(art.clauses || []), ''] } : art)) }
  function setClause(i, ci, v) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, clauses: art.clauses.map((c, x) => x === ci ? v : c) } : art)) }
  function removeClause(i, ci) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, clauses: art.clauses.filter((_, x) => x !== ci) } : art)) }

  async function save() {
    setSaving(true); setDone(false)
    try {
      const res = await fetch('/api/admin/contract-articles', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articles }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setArticles(json.articles || [])
      setDone(true); setTimeout(() => setDone(false), 2500)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  if (loading) return <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground"><FileText className="h-4 w-4" /> متن قرارداد شهریه (مواد و بندها)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          کل متن قرارداد در اینجا قابل ویرایش است. می‌توانید متن هر ماده و بندهای آن را ویرایش کنید، بند یا ماده اضافه یا حذف کنید و ترتیب شماره‌گذاری را تعیین کنید. مقادیر پویا (مبلغ شهریه، نام، تاریخ و ...) با «توکن» جایگزین می‌شوند.
        </p>
      </div>

      <AdminPanel>
        <button type="button" onClick={() => setShowTokens((v) => !v)} className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Info className="h-4 w-4 text-primary" /> راهنمای توکن‌ها (مقادیر پویا) {showTokens ? '▲' : '▼'}
        </button>
        {showTokens ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CONTRACT_TOKENS.map((t) => (
              <div key={t} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs">
                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-primary" dir="ltr">{'{' + t + '}'}</code>
                <span className="text-muted-foreground">{TOKEN_HELP[t] || ''}</span>
              </div>
            ))}
            <p className="sm:col-span-2 lg:col-span-3 mt-1 text-[11px] text-muted-foreground">
              برای پررنگ‌کردن بخشی از متن، آن را بین <code className="font-mono" dir="ltr">**</code> بگذارید. مثال: <span dir="ltr" className="font-mono">**بستگی به سایز**</span>
            </p>
          </div>
        ) : null}
      </AdminPanel>

      <div className="space-y-4">
        {articles.map((art, i) => (
          <AdminPanel key={i}>
            <div className="flex items-center gap-2">
              <input className={inputCls} value={art.title} onChange={(e) => setTitle(i, e.target.value)} placeholder={`عنوان ماده (مثلاً ماده ${i + 1}- ...)`} />
              <button type="button" onClick={() => removeArticle(i)} className="shrink-0 text-destructive" title="حذف ماده"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
                <input type="checkbox" checked={Boolean(art.numbered)} onChange={(e) => setNumbered(i, e.target.checked)} className="size-4 accent-primary" />
                بندها شماره‌گذاری شوند (۱- ۲- ...)
              </label>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
                <input type="checkbox" checked={Boolean(art.signatures)} onChange={(e) => setSignatures(i, e.target.checked)} className="size-4 accent-primary" />
                زیر این ماده، امضای ولی و مؤسس نمایش داده شود
              </label>
            </div>
            <div className="mt-3 space-y-2 pr-2">
              {(art.clauses || []).map((clause, ci) => (
                <div key={ci} className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-bold text-muted-foreground">{art.numbered ? `${(ci + 1).toLocaleString('fa-IR')}-` : '•'}</span>
                  <textarea className={`${inputCls} h-20 py-2`} value={clause} onChange={(e) => setClause(i, ci, e.target.value)} placeholder="متن بند" />
                  <button type="button" onClick={() => removeClause(i, ci)} className="mt-2 shrink-0 text-destructive"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <AdminButton variant="secondary" size="sm" onClick={() => addClause(i)}><Plus className="h-3.5 w-3.5" /> افزودن بند</AdminButton>
            </div>
          </AdminPanel>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton variant="secondary" onClick={addArticle}><Plus className="h-4 w-4" /> افزودن ماده</AdminButton>
        <AdminButton variant="primary" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره متن قرارداد'}</AdminButton>
        {done ? <span className="text-sm font-bold text-emerald-600">✓ ذخیره شد</span> : null}
      </div>
    </div>
  )
}
