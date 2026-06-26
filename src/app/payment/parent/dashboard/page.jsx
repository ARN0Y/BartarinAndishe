import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import ParentDashboardClient from '@/components/portal/ParentDashboardClient'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function ParentDashboardPage() {
  const session = await getSession('parent')
  if (!session) redirect('/payment/parent/login')

  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-muted-foreground">در حال بارگذاری...</div>}>
      <ParentDashboardClient />
    </Suspense>
  )
}
