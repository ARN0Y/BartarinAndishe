'use client'

import { useCallback, useEffect, useState } from 'react'
import { rialToTomanWords } from '@/lib/numberToWords'
import {
  AdminPageHeader, AdminPanel, AdminButton, inputCls, labelCls,
} from '@/components/admin/ui/AdminUI'

function formatThousands(val) {
  const digits = String(val || '').replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

function AssetUpload({ label, hint, currentUrl, uploading, onUpload }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-sm font-bold text-slate-800">{label}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {currentUrl ? (
        <img src={currentUrl} alt={label} className="mt-3 max-h-24 w-auto rounded-lg border border-slate-200 bg-white p-2" />
      ) : (
        <p className="mt-3 text-xs text-amber-700">هنوز بارگذاری نشده</p>
      )}
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
        {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

export default function AdminContractSettingsPanel({ academicYear }) {
  const [settings, setSettings] = useState(null)
  const [tuitionRial, setTuitionRial] = useState('')
  const [tuitionRialWords, setTuitionRialWords] = useState('')
  const [uniformBoyToman, setUniformBoyToman] = useState('')
  const [uniformGirlToman, setUniformGirlToman] = useState('')
  const [bagSetToman, setBagSetToman] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/contract-settings?year=${encodeURIComponent(academicYear)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setSettings(json.settings)
      setTuitionRial(json.settings.tuitionRial ? formatThousands(json.settings.tuitionRial) : '')
      setTuitionRialWords(json.settings.tuitionRialWords || '')
      setUniformBoyToman(json.settings.uniformBoyToman ? formatThousands(json.settings.uniformBoyToman) : '')
      setUniformGirlToman(json.settings.uniformGirlToman ? formatThousands(json.settings.uniformGirlToman) : '')
      setBagSetToman(json.settings.bagSetToman ? formatThousands(json.settings.bagSetToman) : '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [academicYear])

  useEffect(() => {
    load()
  }, [load])

  async function saveAmounts(autoWords = false) {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/contract-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: academicYear,
          tuitionRial: tuitionRial.replace(/\D/g, ''),
          tuitionRialWords,
          autoWords,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setSettings(json.settings)
      setTuitionRialWords(json.settings.tuitionRialWords || '')
      setMessage('مبلغ شهریه ذخیره شد.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveUniformPrices() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/contract-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: academicYear,
          uniformBoyToman: uniformBoyToman.replace(/\D/g, ''),
          uniformGirlToman: uniformGirlToman.replace(/\D/g, ''),
          bagSetToman: bagSetToman.replace(/\D/g, ''),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setSettings(json.settings)
      setMessage('قیمت‌های فرم و کیف ذخیره شد.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadAsset(assetType, file) {
    setUploading(assetType)
    setMessage('')
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('assetType', assetType)
      formData.append('year', academicYear)
      const res = await fetch('/api/admin/contract-settings', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setSettings(json.settings)
      setMessage('تصویر با موفقیت بارگذاری شد.')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading('')
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-sm text-slate-500">در حال بارگذاری...</p>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="تنظیمات قرارداد شهریه"
        description={`سال تحصیلی ${academicYear} — مبلغ و امضاهای مشترک برای همه قراردادها`}
      />

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <AdminPanel>
        <h3 className="mb-4 text-sm font-bold text-slate-800">مبلغ شهریه</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>مبلغ شهریه (ریال)</label>
            <input
              className={inputCls}
              dir="ltr"
              value={tuitionRial}
              onChange={(e) => setTuitionRial(formatThousands(e.target.value))}
              placeholder="مثلاً 500,000,000"
            />
            {tuitionRial ? (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {rialToTomanWords(tuitionRial.replace(/\D/g, ''))}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>مبلغ به حروف</label>
            <input
              className={inputCls}
              value={tuitionRialWords}
              onChange={(e) => setTuitionRialWords(e.target.value)}
              placeholder="مثلاً پانصد میلیون ریال"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminButton onClick={() => saveAmounts(false)} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره مبلغ'}
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => saveAmounts(true)} disabled={saving || !tuitionRial}>
            پر کردن خودکار «به حروف»
          </AdminButton>
        </div>
        {settings?.tuitionRialFormatted ? (
          <p className="mt-3 text-xs text-slate-500">پیش‌نمایش: {settings.tuitionRialFormatted}</p>
        ) : null}
      </AdminPanel>

      <AdminPanel>
        <h3 className="mb-1 text-sm font-bold text-slate-800">قیمت فرم و کیف (بند ۷ قرارداد)</h3>
        <p className="mb-4 text-xs text-slate-500">مبالغ به تومان — در متن قرارداد والدین نمایش داده می‌شود.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls}>هزینه فرم نوآموز پسر (تومان)</label>
            <input
              className={inputCls}
              dir="ltr"
              value={uniformBoyToman}
              onChange={(e) => setUniformBoyToman(formatThousands(e.target.value))}
              placeholder="مثلاً 700,000"
            />
          </div>
          <div>
            <label className={labelCls}>هزینه فرم نوآموز دختر با مقنعه (تومان)</label>
            <input
              className={inputCls}
              dir="ltr"
              value={uniformGirlToman}
              onChange={(e) => setUniformGirlToman(formatThousands(e.target.value))}
              placeholder="مثلاً 800,000"
            />
          </div>
          <div>
            <label className={labelCls}>قیمت کیف و جامدادی (تومان)</label>
            <input
              className={inputCls}
              dir="ltr"
              value={bagSetToman}
              onChange={(e) => setBagSetToman(formatThousands(e.target.value))}
              placeholder="مثلاً 400,000"
            />
          </div>
        </div>
        <div className="mt-4">
          <AdminButton onClick={saveUniformPrices} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره قیمت‌های فرم و کیف'}
          </AdminButton>
        </div>
      </AdminPanel>

      <AdminPanel>
        <h3 className="mb-4 text-sm font-bold text-slate-800">امضا و مهر (یکسان برای همه قراردادها)</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <AssetUpload
            label="امضای مدیر کودکستان"
            hint="تصویر امضای سرکار خانم منیر گلابدار"
            currentUrl={settings?.managerSignatureUrl}
            uploading={uploading === 'managerSignature'}
            onUpload={(file) => uploadAsset('managerSignature', file)}
          />
          <AssetUpload
            label="مهر کودکستان"
            hint="تصویر مهر با تاریخ — در بخش «امضا و تاریخ مهر کودکستان»"
            currentUrl={settings?.managerStampUrl}
            uploading={uploading === 'managerStamp'}
            onUpload={(file) => uploadAsset('managerStamp', file)}
          />
          <AssetUpload
            label="امضای مؤسس"
            hint="تصویر امضای شهرام گیوی"
            currentUrl={settings?.founderSignatureUrl}
            uploading={uploading === 'founderSignature'}
            onUpload={(file) => uploadAsset('founderSignature', file)}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
