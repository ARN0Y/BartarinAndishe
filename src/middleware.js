import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIES = {
  admin: 'ba_admin_session',
  parent: 'ba_parent_session',
}

async function verify(token) {
  if (!token || !process.env.JWT_SECRET) return null
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    )
    return payload
  } catch {
    return null
  }
}

function normalizeDevHost(request) {
  if (process.env.NODE_ENV === 'production' || !process.env.NEXT_PUBLIC_APP_URL) return null

  let canonical
  try {
    canonical = new URL(process.env.NEXT_PUBLIC_APP_URL)
  } catch {
    return null
  }

  const currentHost = request.headers.get('host') || request.nextUrl.host
  const currentName = currentHost.split(':')[0].replace(/^\[|\]$/g, '')
  const isLocalHost = currentName === 'localhost' || currentName === '127.0.0.1' || currentName === '::1'

  if (!isLocalHost || currentHost === canonical.host) return null

  const url = request.nextUrl.clone()
  url.protocol = canonical.protocol
  url.hostname = canonical.hostname
  url.port = canonical.port
  return NextResponse.redirect(url)
}

// پشت nginx مقدار request.url ممکن است localhost:3000 باشد؛ مبدأ واقعی را از هدرها می‌سازیم
function siteBase(request) {
  const proto = request.headers.get('x-forwarded-proto')
    || request.nextUrl.protocol.replace(':', '')
    || 'http'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  return host ? `${proto}://${host}` : request.url
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const hostRedirect = normalizeDevHost(request)
  if (hostRedirect) return hostRedirect

  // ─── Redirect قدیمی /payment/admin به /admin ─────────────────
  if (pathname.startsWith('/payment/admin')) {
    const newPath = pathname.replace('/payment/admin', '/admin')
    return NextResponse.redirect(new URL(newPath, siteBase(request)))
  }

  // ─── /admin → ورود یا داشبورد ─────────────────────────────────
  if (pathname === '/admin') {
    const token = request.cookies.get(SESSION_COOKIES.admin)?.value
    const session = await verify(token)
    if (session?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', siteBase(request)))
    }
    return NextResponse.redirect(new URL('/admin/login', siteBase(request)))
  }

  // ─── محافظت از /admin/* ───────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
    const token = request.cookies.get(SESSION_COOKIES.admin)?.value
    const session = await verify(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', siteBase(request)))
    }
  }

  // ─── ریدایرکت اگر مدیر لاگین است و به /admin/login می‌رود ────
  if (pathname === '/admin/login') {
    const token = request.cookies.get(SESSION_COOKIES.admin)?.value
    const session = await verify(token)
    if (session?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', siteBase(request)))
    }
  }

  // ─── /payment/parent → ورود یا داشبورد ───────────────────────
  if (pathname === '/payment/parent') {
    const token = request.cookies.get(SESSION_COOKIES.parent)?.value
    const session = await verify(token)
    if (session?.role === 'parent') {
      return NextResponse.redirect(new URL('/payment/parent/dashboard?tab=profile', siteBase(request)))
    }
    return NextResponse.redirect(new URL('/payment/parent/login', siteBase(request)))
  }

  // ─── ریدایرکت اگر والد لاگین است و به login می‌رود ──────────
  if (pathname === '/payment/parent/login') {
    const token = request.cookies.get(SESSION_COOKIES.parent)?.value
    const session = await verify(token)
    if (session?.role === 'parent') {
      return NextResponse.redirect(new URL('/payment/parent/dashboard?tab=profile', siteBase(request)))
    }
  }

  // ─── محافظت از API مدیر ─────────────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(SESSION_COOKIES.admin)?.value
    const session = await verify(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 })
    }
  }

  // ─── محافظت از /payment/parent/* ────────────────────────────
  if (pathname.startsWith('/payment/parent') && !pathname.includes('/login')) {
    const token = request.cookies.get(SESSION_COOKIES.parent)?.value
    const session = await verify(token)
    if (!session || session.role !== 'parent') {
      return NextResponse.redirect(new URL('/payment/parent/login', siteBase(request)))
    }
  }

  // ─── محافظت از API والدین ──────────────────────────────────
  if (pathname.startsWith('/api/parent')) {
    const token = request.cookies.get(SESSION_COOKIES.parent)?.value
    const session = await verify(token)
    if (!session || session.role !== 'parent') {
      return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/parent/:path*',
    '/payment/admin/:path*',
    '/payment/parent/:path*',
  ],
}
