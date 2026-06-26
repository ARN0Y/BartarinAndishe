const ADMIN_TOKEN_KEY = 'ba_admin_token'
const PARENT_TOKEN_KEY = 'ba_parent_token'

export function saveToken(role, token) {
  const key = role === 'admin' ? ADMIN_TOKEN_KEY : PARENT_TOKEN_KEY
  localStorage.setItem(key, token)
}

export function getToken(role) {
  const key = role === 'admin' ? ADMIN_TOKEN_KEY : PARENT_TOKEN_KEY
  return localStorage.getItem(key)
}

export function clearToken(role) {
  const key = role === 'admin' ? ADMIN_TOKEN_KEY : PARENT_TOKEN_KEY
  localStorage.removeItem(key)
}

export function clearAllTokens() {
  clearToken('admin')
  clearToken('parent')
}
