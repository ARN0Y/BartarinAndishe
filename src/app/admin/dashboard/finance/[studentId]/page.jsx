import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import AdminFinanceDetail from '@/components/admin/AdminFinanceDetail'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await getSession('admin')
  if (!session) redirect('/admin/login')

  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>}>
      <AdminFinanceDetail />
    </Suspense>
  )
}
