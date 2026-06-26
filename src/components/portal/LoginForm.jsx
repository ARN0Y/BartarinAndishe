'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NationalIdPinInput from '@/components/ui/NationalIdPinInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const LS_KEY = 'bartarin_saved_nid'

export default function LoginForm({ type, redirectTo }) {
  const router = useRouter()
  const isAdmin = type === 'admin'
  const [form, setForm] = useState({ emailOrUsername: '', password: '', nationalId: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin) return
    try {
      localStorage.removeItem(LS_KEY)
    } catch {}
  }, [isAdmin])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = isAdmin ? '/api/auth/admin/login' : '/api/auth/parent/login'
    const body = isAdmin
      ? { emailOrUsername: form.emailOrUsername, password: form.password }
      : { nationalId: form.nationalId, password: form.password || form.nationalId }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'خطا در ورود')

      router.push(redirectTo ?? (isAdmin ? '/admin/dashboard' : '/payment/parent/dashboard?tab=profile'))
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-5">
          {isAdmin ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">نام کاربری یا ایمیل</Label>
                <Input
                  id="emailOrUsername"
                  value={form.emailOrUsername}
                  onChange={(e) => setForm((v) => ({ ...v, emailOrUsername: e.target.value }))}
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="block text-center">کد ملی نوآموز</Label>
                <NationalIdPinInput
                  value={form.nationalId}
                  onChange={(v) => setForm((prev) => ({ ...prev, nationalId: v }))}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPassword">رمز عبور</Label>
                <Input
                  id="parentPassword"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                  placeholder="رمز عبور"
                  autoComplete="current-password"
                  dir="ltr"
                  className="text-center"
                />
                <p className="text-center text-xs text-muted-foreground">
                  ورود اول: رمز همان کد ملی نوآموز است. می‌توانید بعداً در پنل آن را تغییر دهید.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (!isAdmin && form.nationalId.length !== 10)}
            className="w-full h-11 bg-pink-deep hover:bg-rose text-white"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ورود...
              </span>
            ) : 'ورود به پنل'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
