import { readFileSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

function parseEnvValue(value) {
  const trimmed = value.trim()
  const quote = trimmed[0]
  if ((quote === '"' || quote === "'") && trimmed.at(-1) === quote) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function getRequiredEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  throw new Error(`Missing required environment variable: ${keys.join(' or ')}`)
}

function assertProductionPassword(password) {
  const blockedPasswords = new Set(['141414', 'Test@1234', 'password', 'admin123'])
  if (password.length < 12) {
    throw new Error('Admin password must be at least 12 characters')
  }
  if (blockedPasswords.has(password)) {
    throw new Error('Refusing to create an admin with a default/test password')
  }
}

const envPath = resolve(import.meta.dirname, '..', '.env')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = parseEnvValue(trimmed.slice(eqIdx + 1))
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const prisma = new PrismaClient()

async function main() {
  const email = getRequiredEnv('ADMIN_EMAIL', 'SEED_ADMIN_EMAIL').toLowerCase()
  const username = getRequiredEnv('ADMIN_USERNAME', 'SEED_ADMIN_USERNAME')
  const password = getRequiredEnv('ADMIN_PASSWORD', 'SEED_ADMIN_PASSWORD')
  assertProductionPassword(password)

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { username, passwordHash },
    create: { email, username, passwordHash },
  })

  console.log('Admin created/updated:')
  console.log(`  Email:    ${email}`)
  console.log(`  Username: ${username}`)
  console.log(`  ID:       ${admin.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
