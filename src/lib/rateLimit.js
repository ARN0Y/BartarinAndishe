const store = new Map()

const LIMITS = {
  'admin-login': { windowMs: 15 * 60 * 1000, maxAttempts: 10 },
  'parent-login': { windowMs: 15 * 60 * 1000, maxAttempts: 8 },
  'parent-forgot': { windowMs: 60 * 60 * 1000, maxAttempts: 6 },
  'pre-register': { windowMs: 60 * 60 * 1000, maxAttempts: 5 },
  default: { windowMs: 15 * 60 * 1000, maxAttempts: 10 },
}

export function checkRateLimit(ip, route) {
  const config = LIMITS[route] || LIMITS.default
  const key = `${ip}::${route}`
  const now = Date.now()
  const entry = store.get(key) ?? { count: 0, resetAt: now + config.windowMs }

  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + config.windowMs
  }

  entry.count += 1
  store.set(key, entry)

  const allowed = entry.count <= config.maxAttempts
  return { allowed, remaining: Math.max(0, config.maxAttempts - entry.count), resetAt: entry.resetAt }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store.entries()) {
    if (now > val.resetAt) store.delete(key)
  }
}, 30 * 60 * 1000)
