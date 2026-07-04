import FounderSection from './FounderSection'
import WhyUsSection from './WhyUsSection'
import ManagerSection from './ManagerSection'
import StaffSection from './StaffSection'
import RegisterInfoSection from './RegisterInfoSection'
import ParentResourcesSection from './ParentResourcesSection'
import ExtraSkillsSection from './ExtraSkillsSection'
import MemoryAlbumsSection from './MemoryAlbumsSection'
import ContentGallerySection from '../ContentGallerySection'
import { contentGallerySections } from '../../data/contentGalleries'
import { staffSectionEnabled } from '../../data/homeSections'

// ترتیب گالری‌ها = ترتیب ساید‌بار
const GALLERY_ORDER = ['edu-activities', 'multiple-intelligence', 'celebrations']

export default function HomeSections({ cms = {}, galleries = null }) {
  const { homeContent, parentResources = [], extraSkills = [], memoryAlbums = [] } = cms

  // اگر override چیدمان موجود بود از آن استفاده کن، وگرنه پیش‌فرض data
  const gallerySections = galleries
    ? GALLERY_ORDER.map((id) => ({ id, ...(galleries[id] || {}) })).filter((s) => (s.strip || []).length > 0)
    : contentGallerySections

  return (
    <>
      <FounderSection info={homeContent?.founder} />
      <WhyUsSection />
      <ManagerSection info={homeContent?.manager} />
      {gallerySections.map((section) => (
        <ContentGallerySection key={section.id} section={section} />
      ))}
      <ExtraSkillsSection items={extraSkills} />
      {staffSectionEnabled ? <StaffSection /> : null}
      <RegisterInfoSection />
      <ParentResourcesSection items={parentResources} />
      <MemoryAlbumsSection albums={memoryAlbums} />
    </>
  )
}
