import Link from 'next/link'
import { redirect } from 'next/navigation'
import BePhonicsGame from '@/components/worksheets/BePhonicsGame'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'کاربرگ حرف «ب» | برترین اندیشه',
}

export const dynamic = 'force-dynamic'

export default async function BePhonicsWorksheetPage() {
  const record = await prisma.interactiveCode.findUnique({ where: { slug: 'be-phonics' } })
  if (!record?.isVisible) {
    redirect('/payment/parent/dashboard?tab=worksheets')
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-pink-soft via-white to-sky-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/payment/parent/dashboard?tab=worksheets"
            className="text-sm font-bold text-navy-light hover:text-pink-deep"
          >
            ← پنل والدین / کاربرگ‌ها
          </Link>
          <Link
            href="/payment/parent/dashboard"
            className="rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-bold text-navy"
          >
            پنل والدین
          </Link>
        </div>
        <BePhonicsGame />
      </div>
    </main>
  )
}
