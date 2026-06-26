const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bartarinandishe.ir'

export default function sitemap() {
  const now = new Date()
  const routes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/pre-register', priority: 0.9, changeFrequency: 'monthly' },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
