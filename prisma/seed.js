import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient, RegistrationStatus, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@bartarinandishe.ir'
  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'Admin'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || '141414'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { username: adminUsername, passwordHash },
    create: { email: adminEmail, username: adminUsername, passwordHash },
  })

  const students = [
    {
      firstName: 'پارسا',
      lastName: 'احمدی',
      nationalId: '0012345678',
      registrationStatus: RegistrationStatus.Confirmed,
    },
    {
      firstName: 'آیلین',
      lastName: 'رضایی',
      nationalId: '0098765432',
      registrationStatus: RegistrationStatus.Confirmed,
    },
    {
      firstName: 'نیلا',
      lastName: 'محمدی',
      nationalId: '0077777777',
      registrationStatus: RegistrationStatus.Pending,
    },
  ]

  for (const student of students) {
    await prisma.student.upsert({
      where: { nationalId: student.nationalId },
      update: student,
      create: student,
    })
  }

  const parsa = await prisma.student.findUnique({ where: { nationalId: '0012345678' } })
  const aylin = await prisma.student.findUnique({ where: { nationalId: '0098765432' } })

  if (parsa && aylin) {
    const payments = [
      {
        studentId: parsa.id,
        amountPaid: 15000000,
        paymentDate: new Date('2026-04-10T08:30:00.000Z'),
        academicYear: '1405-1406',
        trackingId: 'BA-1405-1001',
        status: PaymentStatus.Success,
        description: 'قسط اول شهریه',
      },
      {
        studentId: parsa.id,
        amountPaid: 8000000,
        paymentDate: new Date('2026-05-02T08:30:00.000Z'),
        academicYear: '1405-1406',
        trackingId: 'BA-1405-1002',
        status: PaymentStatus.Success,
        description: 'قسط دوم شهریه',
      },
      {
        studentId: aylin.id,
        amountPaid: 12000000,
        paymentDate: new Date('2026-04-15T08:30:00.000Z'),
        academicYear: '1405-1406',
        trackingId: 'BA-1405-1003',
        status: PaymentStatus.Success,
        description: 'قسط اول شهریه',
      },
      {
        studentId: aylin.id,
        amountPaid: 5000000,
        paymentDate: new Date('2026-05-05T08:30:00.000Z'),
        academicYear: '1405-1406',
        trackingId: 'BA-1405-1004',
        status: PaymentStatus.Failed,
        description: 'پرداخت ناموفق',
      },
    ]

    for (const payment of payments) {
      await prisma.payment.upsert({
        where: { trackingId: payment.trackingId },
        update: payment,
        create: payment,
      })
    }
  }

  await prisma.worksheet.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'کاربرگ تعطیلی — آلودگی هوا',
      description: 'فعالیت‌های پیشنهادی برای روزهای تعطیل به دلیل آلودگی هوا (فایل PDF)',
      fileUrl: '/uploads/worksheets/sample-worksheet.txt',
      fileName: 'sample-worksheet.txt',
      mimeType: 'text/plain',
    },
  })

  await prisma.worksheet.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'راهنمای بازی حرف «ب»',
      description: 'نسخهٔ چاپی مکمل کاربرگ تعاملی آواشناسی حرف ب',
      fileUrl: '/uploads/worksheets/sample-worksheet.txt',
      fileName: 'be-guide.txt',
      mimeType: 'text/plain',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
