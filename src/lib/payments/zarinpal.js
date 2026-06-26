import { config } from '@/lib/config'

const BASE = config.zarinpal.sandbox
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://api.zarinpal.com/pg/v4/payment'

const START_PAY = config.zarinpal.sandbox
  ? 'https://sandbox.zarinpal.com/pg/StartPay'
  : 'https://www.zarinpal.com/pg/StartPay'

async function zarinpalPost(path, body) {
  const res = await fetch(`${BASE}/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data
}

export async function requestPayment({ amount, description, callbackUrl, metadata }) {
  if (!config.zarinpal.merchantId) {
    throw new Error('ZARINPAL_MERCHANT_ID is not configured')
  }

  const result = await zarinpalPost('request', {
    merchant_id: config.zarinpal.merchantId,
    amount,
    description,
    callback_url: callbackUrl,
    metadata: metadata || {},
  })

  const code = result?.data?.code
  if (code !== 100) {
    throw new Error(result?.errors?.message || 'خطا در ایجاد درخواست پرداخت زرین‌پال')
  }

  const authority = result.data.authority
  return {
    authority,
    paymentUrl: `${START_PAY}/${authority}`,
  }
}

export async function verifyPayment({ amount, authority }) {
  if (!config.zarinpal.merchantId) {
    throw new Error('ZARINPAL_MERCHANT_ID is not configured')
  }

  const result = await zarinpalPost('verify', {
    merchant_id: config.zarinpal.merchantId,
    amount,
    authority,
  })

  const code = result?.data?.code
  const refId = result?.data?.ref_id

  return {
    success: code === 100 || code === 101,
    code,
    refId: refId ? String(refId) : null,
    raw: result,
  }
}
