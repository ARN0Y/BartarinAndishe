import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function OldAdminLogin() {
  redirect('/admin/login')
}
