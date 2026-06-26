'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import { Save, Plus, X, FileText } from 'lucide-react'

export default function AdminContractArticlesEditor() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contract-articles')
      const json = await res.json()
      setArticles(json.articles || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function addArticle() { setArticles((a) => [...a, { title: '', clauses: [''] }]) }
  function removeArticle(i) { setArticles((a) => a.filter((_, idx) => idx !== i)) }
  function setTitle(i, v) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, title: v } : art)) }
  function addClause(i) { setArticles((a) => a.map((art, idx) => idx === i ? { ...art, clauses: [...art.clauses, ''] } : art)) }
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
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground"><FileText className="h-4 w-4" /> مواد و بندهای تکمیلی قرارداد شهریه</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          مواد و بندهای زیر در انتهای قرارداد شهریه (قبل از امضاها) به والدین نمایش داده می‌شوند. مواد اصلی قرارداد (طرفین، شهریه، نحوهٔ پرداخت و...) ثابت‌اند.
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">هنوز ماده‌ای اضافه نشده است.</p>
      ) : null}

      <div className="space-y-4">
        {articles.map((art, i) => (
          <AdminPanel key={i}>
            <div className="flex items-center gap-2">
              <input className={inputCls} value={art.title} onChange={(e) => setTitle(i, e.target.value)} placeholder={`عنوان ماده (مثلاً ماده ${i + 6}- ...)`} />
              <button type="button" onClick={() => removeArticle(i)} className="shrink-0 text-destructive" title="حذف ماده"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 space-y-2 pr-2">
              {art.clauses.map((clause, ci) => (
                <div key={ci} className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-bold text-muted-foreground">{(ci + 1).toLocaleString('fa-IR')}-</span>
                  <textarea className={`${inputCls} h-16 py-2`} value={clause} onChange={(e) => setClause(i, ci, e.target.value)} placeholder="متن بند" />
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
        <AdminButton variant="primary" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره مواد قرارداد'}</AdminButton>
        {done ? <span className="text-sm font-bold text-emerald-600">✓ ذخیره شد</span> : null}
      </div>
    </div>
  )
}
