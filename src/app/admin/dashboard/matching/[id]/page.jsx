import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import MatchingGameManager from '@/components/admin/MatchingGameManager'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'مدیریت بازی وصل‌کردنی' }
export const dynamic = 'force-dynamic'

export default async function MatchingGamePage({ params }) {
  const session = await getSession('admin')
  if (!session) redirect('/admin/login')

  const { id } = await params
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="py-10 text-center text-sm text-slate-400">در حال بارگذاری...</div>}>
        <MatchingGameManager gameId={id} />
      </Suspense>
    </div>
  )
}
