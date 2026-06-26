import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeIdCardSeries } from '@/lib/idCardSeries'
import { pickProfileData } from '@/lib/profileFields'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)
    const [student, profile, preReg] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.studentProfile.findUnique({ where: { studentId } }),
      prisma.preRegistration.findFirst({ where: { studentId }, select: { birthDate: true } }),
    ])
    return Response.json({
      student: student
        ? {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            nationalId: student.nationalId,
            academicYear: student.academicYear,
            registrationStatus: student.registrationStatus,
            studentCode: student.studentCode,
          }
        : null,
      profile: profile || {},
      preRegBirthDate: preReg?.birthDate || null,
    })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت پروفایل')
  }
}

const REQUIRED_FIELDS = [
  'photoUrl','birthDate','birthCertIssuePlace','birthPlace','gender','idCardRow','idCardSeries','idCardSerial',
  'fatherFirstName','fatherLastName','fatherNationalId','fatherBirthDate','fatherNationality','fatherPhone','fatherIdNumber','fatherIdIssuePlace','fatherEducation','fatherJob',
  'motherFirstName','motherLastName','motherNationalId','motherBirthDate','motherNationality','motherPhone','motherIdNumber','motherIdIssuePlace','motherEducation','motherJob',
  'housingStatus',
  'address','homePhone','postalCode','shadPhone','govPhone',
]

function isProfileComplete(data) {
  return REQUIRED_FIELDS.every((f) => data[f] && String(data[f]).trim() !== '')
}

export async function PUT(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)
    const data = pickProfileData(await request.json())
    if (data.idCardSeries) data.idCardSeries = normalizeIdCardSeries(data.idCardSeries)

    const existing = await prisma.studentProfile.findUnique({ where: { studentId } })

    // قفل ویرایش برای والدین بعد از تکمیل پروفایل
    if (existing?.profileCompleted) {
      return Response.json({ ok: false, message: 'پروفایل قبلاً تکمیل و قفل شده است. برای ویرایش با مدیریت تماس بگیرید.' }, { status: 403 })
    }
    const merged = { ...(existing || {}), ...data }
    const profileCompleted = isProfileComplete(merged)

    const profile = await prisma.studentProfile.upsert({
      where: { studentId },
      update: { ...data, profileCompleted, updatedAt: new Date() },
      create: { studentId, ...data, profileCompleted },
    })
    return Response.json({ ok: true, profile })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره پروفایل')
  }
}
