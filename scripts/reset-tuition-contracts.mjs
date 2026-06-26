import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const before = {
    contracts: await prisma.tuitionContract.count(),
    plans: await prisma.studentFinancialPlan.count(),
    lines: await prisma.contractPaymentLine.count(),
    amanatRows: await prisma.contractAmanatCashRow.count(),
  }

  console.log('Before:', before)

  await prisma.$transaction([
    prisma.tuitionContract.deleteMany(),
    prisma.contractAmanatCashRow.deleteMany(),
    prisma.contractPaymentLine.deleteMany(),
    prisma.studentFinancialPlan.deleteMany(),
  ])

  const after = {
    contracts: await prisma.tuitionContract.count(),
    plans: await prisma.studentFinancialPlan.count(),
    lines: await prisma.contractPaymentLine.count(),
    amanatRows: await prisma.contractAmanatCashRow.count(),
  }

  console.log('After:', after)
  console.log('Done — all tuition contracts and financial plans cleared.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
