// ترتیب کامل ساید‌بار سایت. آیتم‌های دارای `cms` فقط وقتی نمایش داده می‌شوند که
// محتوای متناظرشان (از پنل مدیریت) موجود باشد. برچسب‌ها از پنل «چیدمان سایت» قابل‌ویرایش‌اند.
export const navItems = [
  { id: 'founder', label: 'معرفی مؤسس', href: '/#founder', section: true, iconName: 'GraduationCap' },
  { id: 'why-us', label: 'چرا برترین اندیشه؟', href: '/#why-us', section: true, iconName: 'Sparkles' },
  { id: 'manager', label: 'معرفی مدیر', href: '/#manager', section: true, iconName: 'Star' },
  { id: 'edu-activities', label: 'فعالیت‌های آموزشی', href: '/#edu-activities', section: true, iconName: 'Palette' },
  { id: 'multiple-intelligence', label: 'پرورش هوش چندگانه', href: '/#multiple-intelligence', section: true, iconName: 'Brain' },
  { id: 'celebrations', label: 'مناسبت‌ها و جشن‌ها', href: '/#celebrations', section: true, iconName: 'PartyPopper' },
  { id: 'extra-skills', label: 'مهارت‌های فوق‌برنامه', href: '/#extra-skills', section: true, iconName: 'Sparkles' },
  { id: 'pre-register', label: 'پیش ثبت‌نام', href: '/pre-register', iconName: 'FileEdit' },
  { id: 'register-info', label: 'ثبت‌نام و تماس', href: '/#register-info', section: true, iconName: 'ClipboardList' },
  { id: 'parent-resources', label: 'آنچه والدین باید بدانند', href: '/#parent-resources', section: true, iconName: 'BookOpenCheck', cms: 'parentResources' },
  { id: 'memories', label: 'آلبوم خاطرات سالانه', href: '/#memories', section: true, iconName: 'Images', cms: 'memoryAlbums' },
]
