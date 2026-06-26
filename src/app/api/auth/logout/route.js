import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/session'

export async function POST(request) {
  const { role } = await request.json().catch(() => ({ role: 'parent' }))
  const response = NextResponse.json({ ok: true })
  clearSessionCookie(response, role === 'admin' ? 'admin' : 'parent')
  return response
}
