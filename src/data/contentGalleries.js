/**
 * گالری‌های محتوایی — زیر «معرفی مدیر»
 * هر بخش: id (برای منو و #anchor)، strip (مثل heroGalleryStrip)
 *
 * ویرایش تصاویر:
 *   { id: 'a1', type: 'image', src: '/images/...', caption: 'متن کوتاه' }
 *   { id: 'v1', type: 'video', src: '/videos/....mp4', poster: '/images/....jpg', caption: '...' }
 */

export const contentGallerySections = [
  {
    id: 'edu-activities',
    badge: 'فعالیت‌های آموزشی',
    title: 'فعالیت‌های آموزشی در کودکستان ما',
    subtitle: 'یادگیری خلاق، بازی و کشف — برای رشد همه‌جانبه فرزند شما',
    strip: [
      { id: 'a1', type: 'image', src: '/images/s1.jpg', caption: 'مهارت لیوان‌چینی با مربی مجزا' },
      { id: 'a2', type: 'image', src: '/images/s2.jpg', caption: 'فوق‌برنامه رباتیک' },
      { id: 'a3', type: 'image', src: '/images/s3.jpg', caption: 'آموزش خلاق' },
      { id: 'a4', type: 'image', src: '/images/s3-1.jpg', caption: 'کار خلاقانه کودکان' },
      { id: 'a5', type: 'image', src: '/images/s2-1.jpg', caption: 'ساخت و خلاقیت' },
      { id: 'a6', type: 'image', src: '/images/s3-2.jpg', caption: 'یادگیری با بازی' },
    ],
  },
  {
    id: 'multiple-intelligence',
    badge: 'هوش چندگانه',
    title: 'پرورش هوش چندگانه',
    subtitle: 'برنامه‌های متنوع برای پرورش همزمان ابعاد مختلف هوشی کودکان',
    strip: [
      { id: 'm1', type: 'image', src: '/images/h4.jpg', caption: 'هوش‌های چندگانه' },
      { id: 'm2', type: 'image', src: '/images/s3-3.jpg', caption: 'یادگیری فعال' },
      { id: 'm3', type: 'image', src: '/images/h3-2.jpg', caption: 'محیط یادگیری چندبعدی' },
      { id: 'm4', type: 'image', src: '/images/s2-2.jpg', caption: 'خلاقیت و تفکر' },
      { id: 'm5', type: 'image', src: '/images/h3-4.jpg', caption: 'کلاس درس پویا' },
    ],
  },
  {
    id: 'celebrations',
    badge: 'مناسبت‌ها',
    title: 'برگزاری مناسبت‌های ملی و مذهبی و ...',
    subtitle: 'جشن‌ها و برنامه‌های فرهنگی برای آشنایی کودکان با ارزش‌ها و مناسبت‌های ملی و مذهبی',
    strip: [
      { id: 'c1', type: 'image', src: '/images/h1.jpg', caption: 'جشن و شادپایی' },
      { id: 'c2', type: 'image', src: '/images/h2.jpg', caption: 'مناسبت‌های ملی' },
      { id: 'c3', type: 'image', src: '/images/h3.jpg', caption: 'برنامه‌های گروهی' },
      { id: 'c4', type: 'image', src: '/images/h3-1.jpg', caption: 'فعالیت‌های فرهنگی' },
      { id: 'c5', type: 'image', src: '/images/h3-3.jpg', caption: 'جشن کلاسی' },
    ],
  },
]
