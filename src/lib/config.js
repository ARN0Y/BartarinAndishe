export const config = {
  academicYear: process.env.CURRENT_ACADEMIC_YEAR || '1405-1406',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET,
  zarinpal: {
    merchantId: process.env.ZARINPAL_MERCHANT_ID || '',
    sandbox: process.env.ZARINPAL_SANDBOX !== 'false',
  },
}

export function assertConfig() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters')
  }
}
