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

export default function HomeSections({ cms = {} }) {
  const { homeContent, parentResources = [], extraSkills = [], memoryAlbums = [] } = cms
  return (
    <>
      <FounderSection info={homeContent?.founder} />
      <WhyUsSection />
      <ManagerSection info={homeContent?.manager} />
      <ParentResourcesSection items={parentResources} />
      <ExtraSkillsSection items={extraSkills} />
      {contentGallerySections.map((section) => (
        <ContentGallerySection key={section.id} section={section} />
      ))}
      <MemoryAlbumsSection albums={memoryAlbums} />
      {staffSectionEnabled ? <StaffSection /> : null}
      <RegisterInfoSection />
    </>
  )
}
