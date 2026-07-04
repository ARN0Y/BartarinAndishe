import { getSession } from '@/lib/auth/session'
import { getActiveAnnouncements } from '@/lib/services/announcementService'
import { getMergedHomeContent } from '@/lib/services/homeContentService'
import { listContentBlocks } from '@/lib/services/contentService'
import { listAlbums } from '@/lib/services/memoryAlbumService'
import { getMergedSiteLayout } from '@/lib/services/siteLayoutService'
import HomePage from '../components/HomePage'

export const dynamic = 'force-dynamic'

async function loadCms() {
  try {
    const [homeContent, parentResources, extraSkills, memoryAlbums] = await Promise.all([
      getMergedHomeContent(),
      listContentBlocks('parentResource', { onlyVisible: true }),
      listContentBlocks('extraSkill', { onlyVisible: true }),
      listAlbums({ onlyVisible: true }),
    ])
    return { homeContent, parentResources, extraSkills, memoryAlbums }
  } catch {
    return { homeContent: null, parentResources: [], extraSkills: [], memoryAlbums: [] }
  }
}

async function loadSiteLayout() {
  try {
    return await getMergedSiteLayout()
  } catch {
    return null
  }
}

export default async function Page() {
  const [adminSession, parentSession, announcements, cms, siteLayout] = await Promise.all([
    getSession('admin'),
    getSession('parent'),
    getActiveAnnouncements(),
    loadCms(),
    loadSiteLayout(),
  ])

  const sessionData = adminSession
    ? { type: 'admin', dashUrl: '/admin/dashboard', label: 'داشبورد مدیریت' }
    : parentSession
    ? { type: 'parent', dashUrl: '/payment/parent/dashboard', label: 'داشبورد اولیا' }
    : null

  return <HomePage sessionData={sessionData} announcements={announcements} cms={cms} siteLayout={siteLayout} />
}
