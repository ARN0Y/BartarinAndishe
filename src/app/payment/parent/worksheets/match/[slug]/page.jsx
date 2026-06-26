import { redirect } from 'next/navigation'
import MatchingGame from '@/components/worksheets/MatchingGame'
import { getMatchingGameBySlug } from '@/lib/services/matchingGameService'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params
    const game = await getMatchingGameBySlug(slug, { visibleOnly: true })
    return { title: `${game.title} | برترین اندیشه` }
  } catch {
    return { title: 'بازی وصل‌کردنی | برترین اندیشه' }
  }
}

export default async function MatchingPlayPage({ params }) {
  const { slug } = await params

  let game
  try {
    game = await getMatchingGameBySlug(slug, { visibleOnly: true })
  } catch {
    redirect('/payment/parent/dashboard?tab=worksheets')
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-violet-50 via-white to-pink-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <MatchingGame game={game} />
      </div>
    </main>
  )
}
