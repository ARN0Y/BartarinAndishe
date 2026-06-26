import { rialToTomanWords } from '@/lib/numberToWords'

/** متن «به حروف» به تومان زیر فیلدهای مبلغ (ریال) در مدیریت مالی */
export default function AmountRialHint({ rial, className = 'mt-1 text-xs font-semibold text-slate-600' }) {
  const text = rialToTomanWords(rial)
  if (!text) return null
  return <p className={className}>{text}</p>
}
