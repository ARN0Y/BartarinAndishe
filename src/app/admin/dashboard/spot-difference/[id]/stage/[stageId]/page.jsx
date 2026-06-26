import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import SpotDifferenceEditor from '@/components/admin/SpotDifferenceEditor'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'علامت‌گذاری تفاوت‌ها — مدیریت' }
export const dynamic = 'force-dynamic'

export default async function SpotDifferenceStageEditorPage({ params }) {
  const session = await getSession('admin')
  if (!session) redirect('/admin/login')

  const { id, stageId } = await params
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="py-10 text-center text-sm text-slate-400">در حال بارگذاری...</div>}>
        <SpotDifferenceEditor gameId={id} stageId={stageId} />
      </Suspense>
    </div>
  )
}
