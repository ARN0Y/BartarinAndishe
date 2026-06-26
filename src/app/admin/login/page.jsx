import LoginForm from '@/components/portal/LoginForm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'ورود مدیر — کودکستان برترین اندیشه' }
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const session = await getSession('admin')
  if (session) redirect('/admin/dashboard')

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <img src="/images/logo.svg" alt="لوگو" className="mx-auto mb-4 h-16 w-auto" />
          </Link>
          <p className="text-xs font-semibold text-pink-deep">کودکستان برترین اندیشه</p>
          <h1 className="mt-2 text-xl font-extrabold text-foreground">ورود مدیریت</h1>
          <p className="mt-2 text-sm text-muted-foreground">نام کاربری و رمز عبور مدیر را وارد کنید.</p>
        </div>
        <LoginForm type="admin" redirectTo="/admin/dashboard" />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline transition">بازگشت به سایت</Link>
        </p>
      </div>
    </main>
  )
}
