import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/portal/AdminDashboardClient'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'داشبورد مدیریت — کودکستان برترین اندیشه' }
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getSession('admin')
  if (!session) redirect('/admin/login')

  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-muted">در حال بارگذاری...</div>}>
      <AdminDashboardClient />
    </Suspense>
  )
}
