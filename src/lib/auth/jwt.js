import { SignJWT, jwtVerify } from 'jose'
import { config, assertConfig } from '@/lib/config'

function getSecret() {
  assertConfig()
  return new TextEncoder().encode(config.jwtSecret)
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getSecret())
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload
}
