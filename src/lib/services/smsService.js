import crypto from 'node:crypto'
import { onlyEnglishDigits } from '@/lib/digits'

/**
 * سرویس پیامک — مستقل از ارائه‌دهنده (pluggable).
 * برای فعال‌سازی واقعی، این متغیرها را در .env تنظیم کنید:
 *   SMS_PROVIDER=farazsms|kavenegar
 *   SMS_API_KEY=...               (کلید API درگاه پیامک — برای فراز فقط بخش توکن بعد از «:»)
 *   SMS_SENDER=...                (شمارهٔ خط ارسال)
 *   SMS_OTP_PATTERN_CODE=...      (کد پترن/الگوی OTP در فراز — برای ارسال فوری و بدون بررسی هر پیام)
 * اگر تنظیم نشده باشد، در حالت توسعه کد فقط لاگ می‌شود و برای تست بازگردانده می‌شود.
 *
 * ⚠️ OTP/2FA همیشه از «پترن (الگو)» ارسال می‌شود نه پیامک ساده: پترن یک‌بار توسط
 * اپراتور تأیید می‌شود و پس از آن هر ارسال فوری است؛ اما پیامک ساده روی خط خدماتی
 * هر بار جداگانه بررسی («منتظر تأیید») می‌شود که برای کد ورود قابل‌قبول نیست.
 */
export function isSmsConfigured() {
  return Boolean(process.env.SMS_PROVIDER && process.env.SMS_API_KEY)
}

export function normalizePhone(phone) {
  let p = onlyEnglishDigits(phone)
  if (p.startsWith('98')) p = '0' + p.slice(2)
  if (p.length === 10 && p.startsWith('9')) p = '0' + p // 9xxxxxxxxx → 09xxxxxxxxx
  return p
}

export function isValidMobile(phone) {
  return /^09\d{9}$/.test(normalizePhone(phone))
}

export async function sendSms(phone, text) {
  const provider = process.env.SMS_PROVIDER
  const apiKey = process.env.SMS_API_KEY
  const receptor = normalizePhone(phone)

  if (!provider || !apiKey) {
    console.log(`[SMS:dev] to ${receptor}: ${text}`)
    return { sent: false, reason: 'unconfigured' }
  }

  try {
    if (provider === 'farazsms') {
      // فراز اس‌ام‌اس (iranpayamak) — ارسال ساده
      // هدر احراز هویت فقط توکن است (بخش بعد از «:» در کلید پنل).
      const sender = process.env.SMS_SENDER || ''
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 50000)
      try {
        const res = await fetch('https://api.iranpayamak.com/ws/v1/sms/simple', {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            text,
            line_number: sender,
            recipients: [receptor],
            number_format: 'english',
            schedule: null,
          }),
          signal: controller.signal,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data?.status !== 'success') {
          throw new Error(data?.message || `ارسال پیامک ناموفق بود (HTTP ${res.status}).`)
        }
        return { sent: true, id: data?.data?.id ?? data?.data }
      } finally {
        clearTimeout(timer)
      }
    }
    if (provider === 'kavenegar') {
      const sender = process.env.SMS_SENDER || ''
      const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?receptor=${encodeURIComponent(receptor)}&sender=${encodeURIComponent(sender)}&message=${encodeURIComponent(text)}`
      const res = await fetch(url, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (data?.return?.status !== 200) {
        throw new Error(data?.return?.message || 'ارسال پیامک ناموفق بود.')
      }
      return { sent: true }
    }
    // ارائه‌دهندهٔ ناشناخته — لاگ
    console.log(`[SMS:${provider}] to ${receptor}: ${text}`)
    return { sent: false, reason: 'unknown-provider' }
  } catch (err) {
    console.error('[SMS] send failed:', err?.message)
    return { sent: false, reason: 'error', error: err?.message }
  }
}

// ── OTP ──────────────────────────────────────────────
export function generateOtp() {
  return String(crypto.randomInt(100000, 1000000)) // ۶ رقمی
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

/**
 * ارسال پیامک پترن (الگو) فراز اس‌ام‌اس — برای OTP/2FA.
 * پترن یک‌بار تأیید می‌شود و پس از آن فوری ارسال می‌گردد.
 * attributes مقادیر متغیرهای پترن است (مثلاً برای «%code%» → { code }).
 */
async function sendFarazPattern(receptor, patternCode, attributes) {
  const apiKey = process.env.SMS_API_KEY
  const sender = process.env.SMS_SENDER || ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 50000)
  try {
    const res = await fetch('https://api.iranpayamak.com/ws/v1/sms/pattern', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code: patternCode,
        recipient: receptor,
        line_number: sender,
        number_format: 'english',
        attributes,
      }),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data?.status !== 'success') {
      const msg = typeof data?.message === 'string' ? data.message : `ارسال پیامک ناموفق بود (HTTP ${res.status}).`
      throw new Error(msg)
    }
    return { sent: true, id: data?.data?.id ?? data?.data }
  } finally {
    clearTimeout(timer)
  }
}

export async function sendOtp(phone, code) {
  const provider = process.env.SMS_PROVIDER
  const apiKey = process.env.SMS_API_KEY
  const patternCode = process.env.SMS_OTP_PATTERN_CODE
  const receptor = normalizePhone(phone)

  // مسیر اصلی production: پترن فراز (فوری، بدون بررسی هر پیام)
  if (provider === 'farazsms' && apiKey && patternCode) {
    try {
      return await sendFarazPattern(receptor, patternCode, { code: String(code) })
    } catch (err) {
      console.error('[SMS] pattern OTP send failed:', err?.message)
      return { sent: false, reason: 'error', error: err?.message }
    }
  }

  // fallback (dev/تنظیم‌نشده یا سایر درگاه‌ها): پیامک متنی ساده
  const text = `کد تایید کودکستان برترین اندیشه: ${code}`
  return sendSms(phone, text)
}
