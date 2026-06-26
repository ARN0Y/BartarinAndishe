import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function AdminIndexPage() {
  const session = await getSession('admin')
  redirect(session ? '/admin/dashboard' : '/admin/login')
}
