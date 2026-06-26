import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bartarinandishe.ir'
const SITE_DESCRIPTION =
  'وب‌سایت رسمی کودکستان برترین اندیشه در اصفهان — معرفی موسس و مدیر، فعالیت‌های آموزشی، پرورش هوش چندگانه، پیش‌ثبت‌نام آنلاین و سامانه اولیا (شهریه و کاربرگ).'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'کودکستان برترین اندیشه | پیش‌دبستانی ۱ و ۲ اصفهان',
  description: SITE_DESCRIPTION,
  applicationName: 'کودکستان برترین اندیشه',
  keywords: ['کودکستان', 'پیش‌دبستانی', 'مهد کودک', 'اصفهان', 'برترین اندیشه', 'ثبت‌نام', 'پیش‌ثبت‌نام'],
  authors: [{ name: 'کودکستان برترین اندیشه' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
    siteName: 'کودکستان برترین اندیشه',
    title: 'کودکستان برترین اندیشه | پیش‌دبستانی ۱ و ۲ اصفهان',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
