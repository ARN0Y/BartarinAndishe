import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { completeExcursionPayment } from '@/lib/services/excursionConsentService'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const authority = searchParams.get('Authority') || searchParams.get('authority')
  const status = searchParams.get('Status') || searchParams.get('status')
  const base = `${config.appUrl}/payment/parent/dashboard?tab=excursions`

  if (!authority) {
    return NextResponse.redirect(`${base}&payment=missing`)
  }
  try {
    const { success } = await completeExcursionPayment(authority, status)
    return NextResponse.redirect(`${base}&payment=${success ? 'success' : 'failed'}`)
  } catch {
    return NextResponse.redirect(`${base}&payment=failed`)
  }
}
