import { prisma } from '@/lib/prisma'
import { normalizeAcademicYear } from '@/lib/academicYear'

export function seenConfirmedProfilesKey(academicYear) {
  return `admin_seen_confirmed_${normalizeAcademicYear(academicYear)}`
}

export async function getAdminNavBadges(academicYear) {
  const year = normalizeAcademicYear(academicYear)

  const [preRegPending, lastSeenRow] = await Promise.all([
    prisma.preRegistration.count({
      where: { academicYear: year, status: 'Pending' },
    }),
    prisma.appSetting.findUnique({
      where: { key: seenConfirmedProfilesKey(year) },
    }),
  ])

  const lastSeen = lastSeenRow?.value ? new Date(lastSeenRow.value) : null
  const newCompletedProfiles = await prisma.studentProfile.count({
    where: {
      profileCompleted: true,
      student: { academicYear: year },
      ...(lastSeen ? { updatedAt: { gt: lastSeen } } : {}),
    },
  })

  return {
    academicYear: year,
    preRegPending,
    newCompletedProfiles,
  }
}

export async function markConfirmedProfilesSeen(academicYear) {
  const year = normalizeAcademicYear(academicYear)
  const now = new Date().toISOString()

  await prisma.appSetting.upsert({
    where: { key: seenConfirmedProfilesKey(year) },
    create: { key: seenConfirmedProfilesKey(year), value: now },
    update: { value: now },
  })

  return getAdminNavBadges(year)
}
