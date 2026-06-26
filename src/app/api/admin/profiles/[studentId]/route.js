import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeIdCardSeries } from '@/lib/idCardSeries'
import { pickProfileData } from '@/lib/profileFields'
import { prisma } from '@/lib/prisma'

const REQUIRED_FIELDS = [
  'photoUrl', 'birthDate', 'birthCertIssuePlace', 'birthPlace', 'gender', 'idCardRow', 'idCardSeries', 'idCardSerial',
  'fatherFirstName', 'fatherLastName', 'fatherNationalId', 'fatherBirthDate', 'fatherNationality', 'fatherPhone', 'fatherIdNumber', 'fatherIdIssuePlace', 'fatherEducation', 'fatherJob',
  'motherFirstName', 'motherLastName', 'motherNationalId', 'motherBirthDate', 'motherNationality', 'motherPhone', 'motherIdNumber', 'motherIdIssuePlace', 'motherEducation', 'motherJob',
  'housingStatus',
  'address', 'homePhone', 'postalCode', 'shadPhone', 'govPhone',
]

function isProfileComplete(data) {
  return REQUIRED_FIELDS.every((f) => data[f] && String(data[f]).trim() !== '')
}

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { studentId } = await params
    const sid = Number(studentId)
    const [student, profile] = await Promise.all([
      prisma.student.findUnique({ where: { id: sid } }),
      prisma.studentProfile.findUnique({ where: { studentId: sid } }),
    ])
    if (!student) return Response.json({ message: 'نوآموز یافت نشد.' }, { status: 404 })
    return Response.json({ student, profile: profile || {} })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت پروفایل')
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin()
    const { studentId } = await params
    const sid = Number(studentId)
    const data = pickProfileData(await request.json())
    if (data.idCardSeries) data.idCardSeries = normalizeIdCardSeries(data.idCardSeries)

    const student = await prisma.student.findUnique({ where: { id: sid } })
    if (!student) return Response.json({ message: 'نوآموز یافت نشد.' }, { status: 404 })

    const existing = await prisma.studentProfile.findUnique({ where: { studentId: sid } })
    const merged = { ...(existing || {}), ...data }
    const profileCompleted = isProfileComplete(merged)

    const profile = await prisma.studentProfile.upsert({
      where: { studentId: sid },
      update: { ...data, profileCompleted, updatedAt: new Date() },
      create: { studentId: sid, ...data, profileCompleted },
    })
    return Response.json({ ok: true, profile })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره پروفایل')
  }
}
