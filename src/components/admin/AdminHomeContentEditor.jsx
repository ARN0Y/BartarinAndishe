'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { Save, Plus, X, RotateCcw } from 'lucide-react'

const TEXT_LABELS = {
  image: 'عکس', fullName: 'نام و نام خانوادگی', honorific: 'پیشوند (جناب آقای / سرکار خانم)',
  name: 'نام', role: 'سمت', yearsExperience: 'سابقهٔ درخشان در آموزش و پرورش',
  shortIntro: 'معرفی کوتاه', phone: 'موبایل', instagram: 'اینستاگرام',
  philosophy: 'فلسفهٔ مدیریت', workingHours: 'ساعات حضور', quote: 'نقل‌قول',
  messageTitle: 'عنوان پیام به اولیا', messageShort: 'پیام مؤسس به اولیای محترم',
}
const TEXT_HINTS = {
  yearsExperience: 'خالی بگذارید تا به‌صورت خودکار محاسبه شود (مدیر ۲۵، مؤسس ۳۳ + هر سال یک سال).',
  instagram: 'مثال: @bartarinandishe',
}
const TEXTAREA_KEYS = new Set(['philosophy', 'quote', 'shortIntro', 'messageShort'])
const LIST_LABELS = {
  education: 'تحصیلات و سوابق علمی', responsibilities: 'سوابق حرفه‌ای', highlights: 'سوابق اجرایی و تخصصی',
}

function PersonEditor({ who, label, value, defaults, onChange }) {
  const textKeys = Object.keys(defaults).filter((k) => !Array.isArray(defaults[k]))
  const listKeys = Object.keys(defaults).filter((k) => Array.isArray(defaults[k]))

  function setText(k, v) { onChange({ ...value, [k]: v }) }
  function setListItem(k, i, v) {
    const arr = [...(value[k] || [])]; arr[i] = v; onChange({ ...value, [k]: arr })
  }
  function addListItem(k) { onChange({ ...value, [k]: [...(value[k] || []), ''] }) }
  function removeListItem(k, i) {
    const arr = [...(value[k] || [])]; arr.splice(i, 1); onChange({ ...value, [k]: arr })
  }
  function resetField(k) { onChange({ ...value, [k]: defaults[k] }) }

  return (
    <AdminPanel>
      <h4 className="mb-4 border-b border-border pb-2 text-sm font-bold text-foreground">{label}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {textKeys.map((k) => {
          if (k === 'image') {
            return (
              <div key={k} className="sm:col-span-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium">{TEXT_LABELS[k] || k}</label>
                  <button type="button" onClick={() => resetField(k)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><RotateCcw className="h-3 w-3" /> پیش‌فرض</button>
                </div>
                <AdminImageUpload label="" value={value[k] ?? ''} folder="home" onChange={(url) => setText(k, url)} />
              </div>
            )
          }
          const isTextarea = TEXTAREA_KEYS.has(k)
          return (
            <div key={k} className={isTextarea ? 'sm:col-span-2' : ''}>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">{TEXT_LABELS[k] || k}</label>
                <button type="button" onClick={() => resetField(k)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><RotateCcw className="h-3 w-3" /> پیش‌فرض</button>
              </div>
              {isTextarea ? (
                <textarea className={`${inputCls} h-20 py-2`} value={value[k] ?? ''} onChange={(e) => setText(k, e.target.value)} />
              ) : (
                <input className={inputCls} value={value[k] ?? ''} onChange={(e) => setText(k, e.target.value)} placeholder={k === 'instagram' ? '@bartarinandishe' : undefined} />
              )}
              {TEXT_HINTS[k] ? <p className="mt-1 text-[11px] text-muted-foreground">{TEXT_HINTS[k]}</p> : null}
            </div>
          )
        })}
      </div>

      {listKeys.map((k) => (
        <div key={k} className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">{LIST_LABELS[k] || k}</label>
            <button type="button" onClick={() => resetField(k)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><RotateCcw className="h-3 w-3" /> پیش‌فرض</button>
          </div>
          <div className="space-y-2">
            {(value[k] || []).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} value={item} onChange={(e) => setListItem(k, i, e.target.value)} />
                <button type="button" onClick={() => removeListItem(k, i)} className="text-destructive"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <AdminButton variant="secondary" size="sm" onClick={() => addListItem(k)}><Plus className="h-3.5 w-3.5" /> افزودن مورد</AdminButton>
          </div>
        </div>
      ))}
    </AdminPanel>
  )
}

export default function AdminHomeContentEditor() {
  const [defaults, setDefaults] = useState(null)
  const [manager, setManager] = useState({})
  const [founder, setFounder] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/home-content')
      const json = await res.json()
      setDefaults(json.defaults)
      // مقدار اولیه = پیش‌فرض با اعمال override موجود
      setManager({ ...json.defaults.manager, ...json.overrides.manager })
      setFounder({ ...json.defaults.founder, ...json.overrides.founder })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    setDone(false)
    try {
      const res = await fetch('/api/admin/home-content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ manager, founder }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  if (loading || !defaults) return <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">محتوای صفحهٔ اصلی — مدیر و مؤسس</h3>
        <p className="mt-1 text-sm text-muted-foreground">متن‌ها و فهرست‌های مشخصات مدیر و مؤسس را ویرایش کنید. سابقهٔ سال‌ها به‌صورت خودکار محاسبه می‌شود.</p>
      </div>
      <PersonEditor who="manager" label="مشخصات مدیر" value={manager} defaults={defaults.manager} onChange={setManager} />
      <PersonEditor who="founder" label="مشخصات مؤسس" value={founder} defaults={defaults.founder} onChange={setFounder} />
      <div className="flex items-center gap-3">
        <AdminButton variant="primary" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره محتوای صفحه اصلی'}
        </AdminButton>
        {done ? <span className="text-sm font-bold text-emerald-600">✓ ذخیره شد</span> : null}
      </div>
    </div>
  )
}
