import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import SpotDifferenceGameManager from '@/components/admin/SpotDifferenceGameManager'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'مدیریت مراحل — پیدا کردن تفاوت' }
export const dynamic = 'force-dynamic'

export default async function SpotDifferenceGamePage({ params }) {
  const session = await getSession('admin')
  if (!session) redirect('/admin/login')

  const { id } = await params
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="py-10 text-center text-sm text-slate-400">در حال بارگذاری...</div>}>
        <SpotDifferenceGameManager gameId={id} />
      </Suspense>
    </div>
  )
}
