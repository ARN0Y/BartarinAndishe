const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bartarinandishe.ir'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // بخش‌های خصوصی و سامانه‌ای از ایندکس خارج می‌شوند
        disallow: ['/admin/', '/payment/', '/portal', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
