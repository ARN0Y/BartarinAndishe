import { redirect } from 'next/navigation'
import SpotDifferenceGame from '@/components/worksheets/SpotDifferenceGame'
import { getSpotDifferenceGameBySlug } from '@/lib/services/spotDifferenceService'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params
    const game = await getSpotDifferenceGameBySlug(slug, { visibleOnly: true })
    return { title: `${game.title} | برترین اندیشه` }
  } catch {
    return { title: 'بازی تفاوت | برترین اندیشه' }
  }
}

export default async function SpotDifferencePlayPage({ params }) {
  const { slug } = await params

  let game
  try {
    game = await getSpotDifferenceGameBySlug(slug, { visibleOnly: true })
  } catch {
    redirect('/payment/parent/dashboard?tab=worksheets')
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-amber-50 via-white to-sky-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SpotDifferenceGame game={game} />
      </div>
    </main>
  )
}
