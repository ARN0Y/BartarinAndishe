export const activitySlides = [
  { id: 's1', imageUrl: '/images/s1.jpg', title: 'مهارت لیوان‌چینی با مربی مجزا', linkUrl: '/activity/s1' },
  { id: 's2', imageUrl: '/images/s2.jpg', title: 'فوق‌برنامه رباتیک',              linkUrl: '/activity/s2' },
  { id: 's3', imageUrl: '/images/s3.jpg', title: 'آموزش خلاق',                     linkUrl: '/activity/s3' },
]

export const activityDetails = [
  {
    id: 's1',
    title: 'مهارت لیوان‌چینی با مربی مجزا',
    description:
      'مهارت لیوان‌چینی یکی از فعالیت‌های منحصر به فرد کودکستان برترین اندیشه است که با مربی تخصصی و مجزا برگزار می‌شود. این فعالیت تمرکز، هماهنگی دست و چشم و سرعت عمل کودک را به‌طور چشمگیری تقویت می‌کند.',
    gallery: [
      { src: '/images/s1.jpg', caption: 'مهارت لیوان‌چینی' },
    ],
  },
  {
    id: 's2',
    title: 'فوق‌برنامه رباتیک',
    description:
      'در برنامه رباتیک کودکستان برترین اندیشه، نوآموزان با مفاهیم پایه مهندسی و برنامه‌نویسی آشنا می‌شوند. این فوق‌برنامه تفکر منطقی، حل مسئله و خلاقیت را در کودکان پرورش می‌دهد.',
    gallery: [
      { src: '/images/s2.jpg',   caption: 'فوق‌برنامه رباتیک' },
      { src: '/images/s2-1.jpg', caption: 'ساخت ربات با قطعات رنگی' },
      { src: '/images/s2-2.jpg', caption: 'خلاقیت در ساخت' },
      { src: '/images/s2-3.jpg', caption: 'نمایش ربات ساخته‌شده' },
      { src: '/images/s2-4.jpg', caption: 'کار تیمی در رباتیک' },
    ],
  },
  {
    id: 's3',
    title: 'آموزش خلاق',
    description:
      'آموزش خلاق در برترین اندیشه با روش‌های نوین و بازی‌محور طراحی شده است. این برنامه استعدادهای هنری، ذهنی و اجتماعی کودکان را در قالب فعالیت‌های جذاب شکوفا می‌کند.',
    gallery: [
      { src: '/images/s3.jpg',   caption: 'آموزش خلاق' },
      { src: '/images/s3-1.jpg', caption: 'کار خلاقانه کودکان' },
      { src: '/images/s3-2.jpg', caption: 'آفرینش هنری' },
      { src: '/images/s3-3.jpg', caption: 'یادگیری با بازی' },
    ],
  },
]

export function getActivityById(id) {
  return activityDetails.find((a) => a.id === String(id))
}
