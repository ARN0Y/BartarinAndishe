'use client'

import { useEffect, useState } from 'react'
import { AdminButton, AdminPanel, inputCls } from '@/components/admin/ui/AdminUI'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import AdminVideoUpload from '@/components/admin/AdminVideoUpload'
import { Save, Plus, X, Image as ImageIcon, LayoutList, PanelRight, Images } from 'lucide-react'

const GALLERY_ORDER = ['edu-activities', 'multiple-intelligence', 'celebrations', 'extra-skills']
const GALLERY_LABELS = {
  'edu-activities': 'فعالیت‌های آموزشی',
  'multiple-intelligence': 'پرورش هوش چندگانه',
  'celebrations': 'مناسبت‌ها و جشن‌ها',
  'extra-skills': 'مهارت‌های فوق‌برنامه',
}

function StripEditor({ items, onChange }) {
  const list = items || []

  function update(i, patch) {
    onChange(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  function remove(i) {
    onChange(list.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...list, { id: `new-${Date.now()}`, type: 'image', src: '', caption: '' }])
  }

  return (
    <div className="space-y-3">
      {list.map((it, i) => (
        <div key={it.id || i} className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                  value={it.type === 'video' ? 'video' : 'image'}
                  onChange={(e) => update(i, { type: e.target.value })}
                >
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                </select>
                <span className="text-[11px] text-muted-foreground">مورد {i + 1}</span>
              </div>
              {it.type === 'video' ? (
                <>
                  <AdminVideoUpload label="ویدیو" value={it.src || ''} onChange={(url) => update(i, { src: url })} />
                  <AdminImageUpload label="تصویر پوستر (اختیاری)" value={it.poster || ''} folder="cms" onChange={(url) => update(i, { poster: url })} />
                </>
              ) : (
                <AdminImageUpload label="" value={it.src || ''} folder="cms" onChange={(url) => update(i, { src: url })} />
              )}
              <input className={inputCls} value={it.caption || ''} onChange={(e) => update(i, { caption: e.target.value })} placeholder="توضیح کوتاه (زیرنویس)" />
            </div>
            <button type="button" onClick={() => remove(i)} className="shrink-0 text-destructive" title="حذف"><X className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      <AdminButton variant="secondary" size="sm" onClick={add}><Plus className="h-3.5 w-3.5" /> افزودن تصویر/ویدیو</AdminButton>
    </div>
  )
}

export default function AdminSiteLayoutPanel() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [defaults, setDefaults] = useState(null)
  const [navOrder, setNavOrder] = useState([])
  const [header, setHeader] = useState({ brandTop: '', brandMain: '', logoUrl: '' })
  const [nav, setNav] = useState({})
  const [galleries, setGalleries] = useState({})
  const [heroStrip, setHeroStrip] = useState([])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/site-layout')
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا')
      setDefaults(json.defaults)
      setNavOrder(json.navOrder || [])
      setHeader({ ...json.current.header })
      setNav({ ...json.current.nav })
      setGalleries(JSON.parse(JSON.stringify(json.current.galleries || {})))
      setHeroStrip(JSON.parse(JSON.stringify(json.current.heroStrip || [])))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    setDone(false)
    setError('')
    try {
      const res = await fetch('/api/admin/site-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ header, nav, galleries, heroStrip }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در ذخیره')
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !defaults) return <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">چیدمان و ساید‌بار سایت</h3>
        <p className="mt-1 text-sm text-muted-foreground">هدر، برچسب‌های منوی سایت و تصاویر بخش‌ها را ویرایش کنید. تغییرات روی صفحهٔ اصلی سایت اعمال می‌شود.</p>
      </div>

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      {/* هدر سایت */}
      <AdminPanel>
        <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-sm font-bold text-foreground"><ImageIcon className="h-4 w-4" /> هدر سایت</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">خط اول برند</label>
            <input className={inputCls} value={header.brandTop || ''} onChange={(e) => setHeader((v) => ({ ...v, brandTop: e.target.value }))} placeholder={defaults.header.brandTop} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">خط دوم برند</label>
            <input className={inputCls} value={header.brandMain || ''} onChange={(e) => setHeader((v) => ({ ...v, brandMain: e.target.value }))} placeholder={defaults.header.brandMain} />
          </div>
        </div>
        <div className="mt-4">
          <AdminImageUpload label="لوگو (خالی = لوگوی پیش‌فرض)" value={header.logoUrl && header.logoUrl !== defaults.header.logoUrl ? header.logoUrl : ''} folder="cms" onChange={(url) => setHeader((v) => ({ ...v, logoUrl: url || defaults.header.logoUrl }))} />
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-1 text-sm font-bold text-foreground">عکس‌های هدر (اسلایدر بالای صفحهٔ اصلی)</p>
          <p className="mb-3 text-[11px] text-muted-foreground">قاب‌های تصویری/ویدیویی بالای صفحهٔ اصلی — با لیبل (زیرنویس) و امکان افزودن یا حذف.</p>
          <StripEditor items={heroStrip} onChange={setHeroStrip} />
        </div>
      </AdminPanel>

      {/* برچسب‌های ساید‌بار + پیش‌نمایش */}
      <AdminPanel>
        <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-sm font-bold text-foreground"><PanelRight className="h-4 w-4" /> برچسب‌های ساید‌بار (به‌ترتیب نمایش)</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {navOrder.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">{idx + 1}</span>
              <input
                className={inputCls}
                value={nav[item.id] ?? ''}
                onChange={(e) => setNav((v) => ({ ...v, [item.id]: e.target.value }))}
                placeholder={defaults.nav[item.id] || item.id}
              />
              {item.cms ? <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground" title="فقط وقتی محتوا دارد نمایش داده می‌شود">وابسته به محتوا</span> : null}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          <LayoutList className="ml-1 inline h-3.5 w-3.5" />
          موارد «وابسته به محتوا» (مهارت‌های فوق‌برنامه، آنچه والدین باید بدانند، آلبوم خاطرات) فقط وقتی در سایت دیده می‌شوند که محتوایشان را از تب‌های مربوطه اضافه کرده باشید.
        </p>
      </AdminPanel>

      {/* گالری بخش‌ها */}
      {GALLERY_ORDER.map((id) => {
        const g = galleries[id] || { badge: '', title: '', subtitle: '', strip: [] }
        return (
          <AdminPanel key={id}>
            <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-sm font-bold text-foreground"><Images className="h-4 w-4" /> {GALLERY_LABELS[id]}</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">برچسب کوتاه</label>
                <input className={inputCls} value={g.badge || ''} onChange={(e) => setGalleries((v) => ({ ...v, [id]: { ...g, badge: e.target.value } }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">عنوان</label>
                <input className={inputCls} value={g.title || ''} onChange={(e) => setGalleries((v) => ({ ...v, [id]: { ...g, title: e.target.value } }))} />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1.5 block text-sm font-medium">زیرعنوان</label>
              <input className={inputCls} value={g.subtitle || ''} onChange={(e) => setGalleries((v) => ({ ...v, [id]: { ...g, subtitle: e.target.value } }))} />
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-foreground">تصاویر و ویدیوهای این بخش</p>
              <StripEditor items={g.strip} onChange={(strip) => setGalleries((v) => ({ ...v, [id]: { ...g, strip } }))} />
            </div>
          </AdminPanel>
        )
      })}

      <div className="flex items-center gap-3">
        <AdminButton variant="primary" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره چیدمان سایت'}
        </AdminButton>
        {done ? <span className="text-sm font-bold text-emerald-600">✓ ذخیره شد</span> : null}
      </div>
    </div>
  )
}
