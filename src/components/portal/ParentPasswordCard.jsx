'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, ShieldCheck } from 'lucide-react'

export default function ParentPasswordCard() {
  const [hasCustom, setHasCustom] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/parent/password')
      .then((r) => r.json())
      .then((j) => setHasCustom(Boolean(j.hasCustomPassword)))
      .catch(() => {})
  }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setDone(false)
    if (form.newPassword !== form.confirmPassword) {
      setError('رمز جدید و تکرار آن یکسان نیستند.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/parent/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'خطا در تغییر رمز')
      setDone(true)
      setHasCustom(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-5 w-5" />
          تغییر رمز عبور
        </CardTitle>
        <CardDescription className="mt-1">
          {hasCustom
            ? 'برای امنیت بیشتر می‌توانید رمز خود را تغییر دهید.'
            : 'رمز فعلی شما کد ملی نوآموز است. می‌توانید رمز اختصاصی تعیین کنید.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="curPass">رمز فعلی</Label>
            <Input id="curPass" type="password" dir="ltr" value={form.currentPassword}
              onChange={(e) => setForm((v) => ({ ...v, currentPassword: e.target.value }))}
              placeholder={hasCustom ? 'رمز فعلی' : 'کد ملی نوآموز'} autoComplete="current-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPass">رمز جدید</Label>
            <Input id="newPass" type="password" dir="ltr" value={form.newPassword}
              onChange={(e) => setForm((v) => ({ ...v, newPassword: e.target.value }))}
              placeholder="حداقل ۶ کاراکتر شامل حروف و اعداد" autoComplete="new-password" required />
            <p className="text-xs text-muted-foreground">رمز باید حداقل ۶ کاراکتر و ترکیبی از حروف و اعداد باشد و با رمز سایر نوآموزان یکسان نباشد.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confPass">تکرار رمز جدید</Label>
            <Input id="confPass" type="password" dir="ltr" value={form.confirmPassword}
              onChange={(e) => setForm((v) => ({ ...v, confirmPassword: e.target.value }))}
              placeholder="تکرار رمز جدید" autoComplete="new-password" required />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive">
              {error}
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              رمز عبور با موفقیت تغییر کرد.
            </div>
          )}

          <Button type="submit" disabled={saving} className="bg-pink-deep hover:bg-rose text-white sm:w-fit">
            {saving ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
