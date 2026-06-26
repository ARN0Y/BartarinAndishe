import { AppError } from '@/lib/errors'
import { getActiveAcademicYear } from '@/lib/academicYear'
import { prisma } from '@/lib/prisma'

const studentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  nationalId: true,
  academicYear: true,
}

const privateInclude = {
  recipients: {
    include: { student: { select: studentSelect } },
  },
}

export async function getActivePublicAnnouncements() {
  try {
    return await prisma.announcement.findMany({
      where: { isActive: true, scope: 'public' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, text: true },
    })
  } catch {
    return []
  }
}

/** @deprecated use getActivePublicAnnouncements */
export async function getActiveAnnouncements() {
  return getActivePublicAnnouncements()
}

export async function getActiveStudentAnnouncements(studentId) {
  try {
    return await prisma.announcement.findMany({
      where: {
        isActive: true,
        scope: 'private',
        recipients: { some: { studentId: Number(studentId) } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, text: true },
    })
  } catch {
    return []
  }
}

export async function listAdminAnnouncements() {
  const activeYear = await getActiveAcademicYear()

  const [publicList, privateList, studentOptions] = await Promise.all([
    prisma.announcement.findMany({
      where: { scope: 'public' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.findMany({
      where: { scope: 'private' },
      include: privateInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.findMany({
      where: { registrationStatus: 'Confirmed', academicYear: activeYear },
      select: studentSelect,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
  ])

  return { public: publicList, private: privateList, studentOptions, activeYear }
}

export async function createAnnouncement({ text, scope = 'public', studentIds }) {
  const trimmed = text?.trim()
  if (!trimmed) throw new AppError(422, 'متن اعلان الزامی است.')

  if (scope === 'private') {
    const ids = [...new Set((studentIds || []).map((id) => Number(id)).filter(Boolean))]
    if (!ids.length) throw new AppError(422, 'حداقل یک نوآموز انتخاب کنید.')

    const activeYear = await getActiveAcademicYear()
    const students = await prisma.student.findMany({
      where: {
        id: { in: ids },
        registrationStatus: 'Confirmed',
        academicYear: activeYear,
      },
    })

    if (students.length !== ids.length) {
      throw new AppError(422, 'برخی نوآموزان یافت نشدند یا مربوط به سال تحصیلی فعال نیستند.')
    }

    return prisma.announcement.create({
      data: {
        text: trimmed,
        scope: 'private',
        recipients: { create: ids.map((studentId) => ({ studentId })) },
      },
      include: privateInclude,
    })
  }

  return prisma.announcement.create({
    data: { text: trimmed, scope: 'public' },
  })
}
