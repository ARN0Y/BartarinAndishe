import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { completeZarinpalPayment } from '@/lib/services/paymentService'

export async function GET(request) {
  const url = new URL(request.url)
  const authority = url.searchParams.get('Authority')
  const status = url.searchParams.get('Status')

  if (!authority) {
    return NextResponse.redirect(`${config.appUrl}/payment/parent/dashboard?payment=missing`)
  }

  try {
    const result = await completeZarinpalPayment(authority, status)
    const qs = result.success
      ? `payment=success&refId=${encodeURIComponent(result.refId || '')}`
      : 'payment=failed'
    return NextResponse.redirect(`${config.appUrl}/payment/parent/dashboard?${qs}`)
  } catch {
    return NextResponse.redirect(`${config.appUrl}/payment/parent/dashboard?payment=failed`)
  }
}
