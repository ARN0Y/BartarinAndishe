import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'

export const SESSION_COOKIES = {
  admin: 'ba_admin_session',
  parent: 'ba_parent_session',
}

function shouldUseSecureCookies() {
  const setting = process.env.SESSION_COOKIE_SECURE?.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(setting)) return true
  if (['0', 'false', 'no', 'off'].includes(setting)) return false
  return process.env.NODE_ENV === 'production'
}

export function attachSessionCookie(response, token, role) {
  response.cookies.set(SESSION_COOKIES[role], token, {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}

export function clearSessionCookie(response, role) {
  response.cookies.set(SESSION_COOKIES[role], '', {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function getSession(role) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIES[role])?.value
  if (!token) return null

  try {
    const payload = await verifyToken(token)
    if (payload.role !== role) return null
    return payload
  } catch {
    return null
  }
}

export async function requireSession(role) {
  const session = await getSession(role)
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}
