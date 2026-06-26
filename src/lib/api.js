import { getToken } from './authStorage'

class ApiError extends Error {
  constructor(message, status, issues = []) {
    super(message)
    this.status = status
    this.issues = issues
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return null
}

export async function apiRequest(path, { method = 'GET', body, role, responseType = 'json' } = {}) {
  const headers = {}

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (role) {
    const token = getToken(role)
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (responseType === 'blob') {
    if (!response.ok) {
      const data = await parseResponse(response)
      throw new ApiError(data?.message || 'خطا در دریافت فایل.', response.status, data?.issues)
    }
    return response.blob()
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(data?.message || 'خطای ناشناخته رخ داد.', response.status, data?.issues)
  }

  return data
}
