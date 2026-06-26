import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth/jwt'
import { AppError } from '@/lib/errors'
import { fullName } from '@/lib/formatters'
import { getActiveAcademicYear } from '@/lib/academicYear'
import { verifyParentPassword, hasCustomPassword } from '@/lib/services/parentPasswordService'

export async function loginAdmin({ emailOrUsername, password }) {
  const input = emailOrUsername.trim()

  const admin = await prisma.adminUser.findFirst({
    where: {
      OR: [{ email: input }, { username: input }],
    },
  })

  if (!admin) {
    throw new AppError(401, 'نام کاربری یا رمز عبور اشتباه است.')
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash)
  if (!isValid) {
    throw new AppError(401, 'نام کاربری یا رمز عبور اشتباه است.')
  }

  const token = await signToken({
    role: 'admin',
    adminId: admin.id,
    email: admin.email,
    username: admin.username,
  })

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      username: admin.username,
    },
  }
}

export async function loginParent({ nationalId, password }) {
  const normalized = nationalId.trim()

  const activeYear = await getActiveAcademicYear()

  const student = await prisma.student.findFirst({
    where: { nationalId: normalized, academicYear: activeYear },
  }) || await prisma.student.findFirst({
    where: { nationalId: normalized },
    orderBy: { academicYear: 'desc' },
  })

  if (!student) {
    throw new AppError(404, 'کد ملی نوآموز در سامانه یافت نشد.')
  }

  const passwordOk = await verifyParentPassword(student, password)
  if (!passwordOk) {
    // پیام راهنما برای بار اول (رمز = کد ملی)
    const hint = hasCustomPassword(student)
      ? 'رمز عبور نادرست است.'
      : 'رمز عبور نادرست است. در ورود اول، رمز همان کد ملی نوآموز است.'
    throw new AppError(401, hint)
  }

  const token = await signToken({
    role: 'parent',
    studentId: student.id,
    nationalId: student.nationalId,
  })

  return {
    token,
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: fullName(student),
      nationalId: student.nationalId,
      registrationStatus: student.registrationStatus,
      hasCustomPassword: hasCustomPassword(student),
    },
  }
}
