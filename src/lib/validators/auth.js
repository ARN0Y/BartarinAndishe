import { z } from 'zod'
import { toEnglishDigits } from '@/lib/digits'

export const adminLoginSchema = z.object({
  emailOrUsername: z.string().min(1, 'نام کاربری یا ایمیل الزامی است.'),
  password: z.string().min(1, 'رمز عبور الزامی است.'),
})

export const parentLoginSchema = z.object({
  nationalId: z.preprocess(
    (value) => toEnglishDigits(value),
    z.string().trim().regex(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد.'),
  ),
  password: z.string().min(1, 'رمز عبور الزامی است.'),
})

export const paymentRequestSchema = z.object({
  amount: z.coerce.number().int().min(1000, 'حداقل مبلغ ۱۰۰۰ ریال'),
})
