/**
 * ═══════════════════════════════════════════════════════════════
 *  گالری هدر — راهنمای ویرایش
 * ═══════════════════════════════════════════════════════════════
 *
 *  ترتیب: از h1 به بعد — هر آیتم یک ردیف در heroGalleryStrip
 *
 *  عکس:
 *    { id: 'h1', type: 'image', src: '/images/h1.jpg', caption: 'متن کوتاه' }
 *
 *  فیلم:
 *    { id: 'h3', type: 'video', src: '/videos/نام.mp4', poster: '/images/poster.jpg', caption: 'متن' }
 *    — فایل ویدیo در public/videos/
 *    — poster: تصویر قبل از پخش
 *
 *  caption: یک جمله کوتاه (حدود ۳–۸ کلمه) روی تصویر نمایش داده می‌شود.
 */

export const heroSlides = [
  { id: 'h1', imageUrl: '/images/h1.jpg', title: 'برترین‌ها ما را انتخاب می‌کنند', subtitle: 'تربیت با اعتماد به نفس و خلاقیت', linkUrl: '/topic/h1' },
  { id: 'h2', imageUrl: '/images/h2.jpg', title: 'دلیل استقبال اولیاء', subtitle: 'تیم مجرب و ارتباط مستمر با خانواده', linkUrl: '/topic/h2' },
  { id: 'h3', imageUrl: '/images/h3.jpg', title: 'فضای کودکستان', subtitle: 'محیطی امن، شاد و سرشار از رنگ', linkUrl: '/topic/h3' },
  { id: 'h4', imageUrl: '/images/h4.jpg', title: 'تقویت هوش‌های چندگانه', subtitle: 'برنامه‌های متنوع آموزشی', linkUrl: '/topic/h4' },
]

export const heroTopics = [
  {
    slug: 'h1',
    title: 'برترین‌ها ما را انتخاب می‌کنند',
    fullTitle: 'ما ادعا نمی‌کنیم که برترین هستیم ولی مطمئن هستیم برترین‌ها ما را انتخاب می‌کنند',
    description: 'در کودکستان برترین اندیشه، هدف ما تربیت کودکانی است که با اعتماد به نفس، خلاقیت و مهارت‌های زندگی آماده ورود به دبستان شوند.',
    gallery: [{ src: '/images/h1.jpg', caption: 'کودکستان برترین اندیشه' }],
  },
  {
    slug: 'h2',
    title: 'دلیل استقبال اولیاء',
    fullTitle: 'چرا خانواده‌ها برترین اندیشه را انتخاب می‌کنند',
    description: 'تیم مجرب، برنامه‌های آموزشی خلاق، فضای استاندارد و ارتباط مستمر با اولیاء.',
    gallery: [{ src: '/images/h2.jpg', caption: 'اعتماد خانواده‌ها' }],
  },
  {
    slug: 'h3',
    title: 'فضای کودکستان',
    fullTitle: 'محیطی امن، شاد و سرشار از رنگ',
    description: 'فضای کودکستان با استانداردهای روز طراحی شده است.',
    gallery: [
      { src: '/images/h3.jpg', caption: 'نمای کودکستان' },
      { src: '/images/h3-1.jpg', caption: 'فضای داخلی' },
      { src: '/images/h3-2.jpg', caption: 'محیط آموزشی' },
      { src: '/images/h3-3.jpg', caption: 'فضای بازی' },
      { src: '/images/h3-4.jpg', caption: 'کلاس درس' },
    ],
  },
  {
    slug: 'h4',
    title: 'تقویت هوش‌های چندگانه',
    fullTitle: 'پرورش همه‌جانبه هوش‌های چندگانه',
    description: 'برنامه‌هایی برای پرورش همزمان هوش‌های مختلف کودکان.',
    gallery: [{ src: '/images/h4.jpg', caption: 'هوش‌های چندگانه' }],
  },
]

export function getHeroTopicBySlug(slug) {
  return heroTopics.find((t) => t.slug === slug)
}

/** ترتیب نمایش هدر — از h1 به جلو؛ برای جابه‌جایی فقط همین آرایه را ویرایش کنید */
export const heroGalleryStrip = [
  { id: 'h1', type: 'image', src: '/images/h1.jpg', caption: 'موسس و مدیر کودکستان برترین اندیشه' },
  { id: 'h2-1', type: 'image', src: '/images/h2-1.jpg', caption: 'کسب رتبه اول جشنواره تدریس' },
  { id: 'h2-2', type: 'image', src: '/images/h2-2.jpg', caption: 'کسب رتبه عالی جشنواره علمی و مهارتی' },
  { id: 'h2-3', type: 'image', src: '/images/h2-3.jpg', caption: 'کسب رتبه برتر جشنواره مهارت محور' },
  { id: 'h2-4', type: 'image', src: '/images/h2-4.jpg', caption: 'کسب رتبه برتر تدریس مربیان' },
  { id: 'h3', type: 'image', src: '/images/h3.jpg', caption: 'وسایل بازی ایمن و استاندارد' },
  { id: 'h3-1', type: 'image', src: '/images/h3-1.jpg', caption: 'فضای داخلی مجهز' },
  { id: 'h3-2', type: 'image', src: '/images/h3-2.jpg', caption: 'محیط یادگیری فعال' },
  { id: 'h3-3', type: 'image', src: '/images/h3-3.jpg', caption: 'حیاط بازی ایمن' },
  { id: 'h3-4', type: 'image', src: '/images/h3-4.jpg', caption: 'کلاس درس استاندارد' },
  { id: 'h4', type: 'image', src: '/images/h4.jpg', caption: 'هوش‌های چندگانه' },
]

/** @deprecated use heroGalleryStrip */
export const heroGalleryItems = heroGalleryStrip.map((item) => ({
  ...item,
  alt: item.caption,
}))
