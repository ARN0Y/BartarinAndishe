import { readFileSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

// Load .env manually
const envPath = resolve(import.meta.dirname, '..', '.env')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const prisma = new PrismaClient()

async function main() {
  const email = 'test@bartarinandishe.ir'
  const username = 'TestAdmin'
  const password = 'Test@1234'
  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { username, passwordHash },
    create: { email, username, passwordHash },
  })

  console.log('Admin created/updated:')
  console.log(`  Email:    ${email}`)
  console.log(`  Username: ${username}`)
  console.log(`  Password: ${password}`)
  console.log(`  ID:       ${admin.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
