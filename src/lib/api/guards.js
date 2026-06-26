import { getSession } from '@/lib/auth/session'
import { AppError } from '@/lib/errors'

export async function requireAdmin() {
  const session = await getSession('admin')
  if (!session) {
    throw new AppError(401, 'لطفاً به عنوان مدیر وارد شوید.')
  }
  return session
}

export async function requireParent() {
  const session = await getSession('parent')
  if (!session) {
    throw new AppError(401, 'لطفاً با کد ملی نوآموز وارد شوید.')
  }
  return session
}
